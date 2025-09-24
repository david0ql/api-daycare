import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment';
import { join } from 'path';
import { ChildrenEntity } from 'src/entities/children.entity';
import { DailyAttendanceEntity } from 'src/entities/daily_attendance.entity';
import { IncidentsEntity } from 'src/entities/incidents.entity';
import { DailyActivitiesEntity } from 'src/entities/daily_activities.entity';
import { DailyObservationsEntity } from 'src/entities/daily_observations.entity';
import { ActivityPhotosEntity } from 'src/entities/activity_photos.entity';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { ChildReportDto } from './dto/child-report.dto';

@Injectable()
export class ReportsService {
  private readonly logo = {
    image: join(process.cwd(), 'src/assets/logo.png'),
    width: 150,
    alignment: 'center' as const,
  };

  private readonly styles = {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5],
    },
    footer: {
      fontSize: 8,
      color: 'gray',
    },
  };

  constructor(
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(DailyAttendanceEntity)
    private readonly attendanceRepository: Repository<DailyAttendanceEntity>,
    @InjectRepository(IncidentsEntity)
    private readonly incidentsRepository: Repository<IncidentsEntity>,
    @InjectRepository(DailyActivitiesEntity)
    private readonly activitiesRepository: Repository<DailyActivitiesEntity>,
    @InjectRepository(DailyObservationsEntity)
    private readonly observationsRepository: Repository<DailyObservationsEntity>,
    @InjectRepository(ActivityPhotosEntity)
    private readonly photosRepository: Repository<ActivityPhotosEntity>,
  ) {}

  async generateAttendanceReport(attendanceReportDto: AttendanceReportDto): Promise<Buffer> {
    const { startDate, endDate } = attendanceReportDto;

    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .where('attendance.attendanceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('child.firstName', 'ASC')
      .getMany();

    return this.createPDFDocument('attendance', { attendances, startDate, endDate });
  }

  async generateChildReport(childReportDto: ChildReportDto): Promise<Buffer> {
    const { childId, startDate, endDate } = childReportDto;

    const child = await this.childrenRepository.findOne({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }

    const [attendances, incidents, activities, observations] = await Promise.all([
      this.attendanceRepository
        .createQueryBuilder('attendance')
        .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
        .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
        .where('attendance.childId = :childId', { childId })
        .andWhere('attendance.attendanceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
        .orderBy('attendance.attendanceDate', 'DESC')
        .getMany(),

      this.incidentsRepository
        .createQueryBuilder('incident')
        .leftJoinAndSelect('incident.incidentType', 'type')
        .where('incident.childId = :childId', { childId })
        .andWhere('incident.incidentDate BETWEEN :startDate AND :endDate', { startDate, endDate })
        .orderBy('incident.incidentDate', 'DESC')
        .getMany(),

      this.activitiesRepository
        .createQueryBuilder('activity')
        .leftJoinAndSelect('activity.attendance', 'attendance')
        .where('activity.childId = :childId', { childId })
        .andWhere('attendance.attendanceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
        .orderBy('activity.timeCompleted', 'DESC')
        .getMany(),

      this.observationsRepository
        .createQueryBuilder('observation')
        .leftJoinAndSelect('observation.attendance', 'attendance')
        .where('observation.childId = :childId', { childId })
        .andWhere('attendance.attendanceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
        .orderBy('observation.createdAt', 'DESC')
        .getMany(),
    ]);

    return this.createPDFDocument('child', { child, attendances, incidents, activities, observations, startDate, endDate });
  }

  async generatePaymentAlertsReport(): Promise<Buffer> {
    const childrenWithAlerts = await this.childrenRepository
      .createQueryBuilder('child')
      .leftJoinAndSelect('child.parentChildRelationships', 'relationship')
      .leftJoinAndSelect('relationship.parent', 'parent')
      .where('child.hasPaymentAlert = :hasPaymentAlert', { hasPaymentAlert: true })
      .andWhere('child.isActive = :isActive', { isActive: true })
      .orderBy('child.lastName', 'ASC')
      .addOrderBy('child.firstName', 'ASC')
      .getMany();

    return this.createPDFDocument('payment-alerts', { childrenWithAlerts });
  }

  private async createPDFDocument(type: string, data: any): Promise<Buffer> {
    const doc = new PDFDocument({ 
      margin: 50,
      pageMargins: [40, 120, 40, 60],
      pageOrientation: 'landscape',
      pageSize: 'A4',
    });
    const buffers: Buffer[] = [];

    doc.on('data', (buffer) => buffers.push(buffer));

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Add header with logo on every page
      doc.on('pageAdded', () => {
        this.addHeaderWithLogo(doc, type, data);
      });

      // Add header to first page
      this.addHeaderWithLogo(doc, type, data);

      switch (type) {
        case 'attendance':
          this.generateAttendancePDF(doc, data);
          break;
        case 'child':
          this.generateChildPDF(doc, data);
          break;
        case 'payment-alerts':
          this.generatePaymentAlertsPDF(doc, data);
          break;
      }

      // Add footer
      this.addFooter(doc);

      doc.end();
    });
  }

  private addHeaderWithLogo(doc: PDFDocument, type: string, data: any): void {
    const today = moment();
    let title = 'Daycare Report';

    // Customize title based on report type
    switch (type) {
      case 'attendance':
        if (data.startDate && data.endDate) {
          title = `Daycare Report - Attendance ${moment(data.startDate).format('MM/DD/YYYY')} to ${moment(data.endDate).format('MM/DD/YYYY')}`;
        } else {
          title = 'Daycare Report - Attendance';
        }
        break;
      case 'child':
        if (data.child) {
          title = `Daycare Report - ${data.child.firstName} ${data.child.lastName}`;
        } else {
          title = 'Daycare Report - Child Report';
        }
        break;
      case 'payment-alerts':
        title = 'Daycare Report - Payment Alerts';
        break;
    }

    // Try to add logo, fallback to text if logo doesn't exist
    try {
      doc.image(this.logo.image, 50, 30, { width: this.logo.width });
    } catch (error) {
      // If logo doesn't exist, just use text
      doc.fontSize(16).text('The Children\'s World', 50, 40, { bold: true });
    }

    doc.fontSize(16)
      .text(title, 220, 40, { bold: true, align: 'center' });

    doc.fontSize(10)
      .text(`Generated on ${today.format('LL')} at ${today.format('LT')}`, 50, 80, { 
        align: 'right',
        color: 'gray' 
      });

    // Draw line under header
    doc.moveTo(50, 100).lineTo(doc.page.width - 50, 100).stroke();
  }

  private addFooter(doc: PDFDocument): void {
    const pageCount = doc.pageCount;
    doc.pageCount = pageCount;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
        .text(`© ${moment().format('YYYY')} The Children's World. This document is confidential and cannot be shared.`, 
              50, doc.page.height - 30, { align: 'center', color: 'gray' });
    }
  }

  private generateAttendancePDF(doc: PDFDocument, data: any): void {
    const { attendances, startDate, endDate } = data;

    // Start content after header
    let yPosition = 120;

    const totalDays = moment(endDate).diff(moment(startDate), 'days') + 1;
    const totalRecords = attendances.length;
    const uniqueChildren = [...new Set(attendances.map(a => a.childId))].length;

    doc.fontSize(14).text('Summary:', 50, yPosition, { bold: true });
    yPosition += 20;
    
    doc.fontSize(12).text(`• Total days: ${totalDays}`, 50, yPosition);
    yPosition += 15;
    doc.text(`• Total records: ${totalRecords}`, 50, yPosition);
    yPosition += 15;
    doc.text(`• Unique children: ${uniqueChildren}`, 50, yPosition);
    yPosition += 25;

    doc.fontSize(14).text('Attendance Details:', 50, yPosition, { bold: true });
    yPosition += 25;

    // Table headers
    doc.fontSize(10).text('Date', 50, yPosition, { bold: true });
    doc.text('Child', 120, yPosition, { bold: true });
    doc.text('Check In', 220, yPosition, { bold: true });
    doc.text('Check Out', 300, yPosition, { bold: true });
    doc.text('Status', 380, yPosition, { bold: true });
    doc.text('Delivered By', 450, yPosition, { bold: true });
    doc.text('Picked Up By', 550, yPosition, { bold: true });

    // Draw line under headers
    doc.moveTo(50, yPosition + 15).lineTo(750, yPosition + 15).stroke();
    yPosition += 25;

    const pageHeight = doc.page.height - 80;

    attendances.forEach((attendance) => {
      if (yPosition > pageHeight) {
        doc.addPage();
        yPosition = 120;
      }

      const date = moment(attendance.attendanceDate).format('DD/MM/YYYY');
      const childName = `${attendance.child.firstName} ${attendance.child.lastName}`;
      const checkIn = attendance.checkInTime ? moment(attendance.checkInTime).format('HH:mm') : 'Not recorded';
      const checkOut = attendance.checkOutTime ? moment(attendance.checkOutTime).format('HH:mm') : 'Not recorded';
      const status = attendance.checkOutTime ? 'Complete' : attendance.checkInTime ? 'Present' : 'Absent';
      const deliveredBy = attendance.deliveredBy2 ? attendance.deliveredBy2.name : 'Not recorded';
      const pickedUpBy = attendance.pickedUpBy2 ? attendance.pickedUpBy2.name : 'Not recorded';

      doc.fontSize(9).text(date, 50, yPosition);
      doc.text(childName, 120, yPosition);
      doc.text(checkIn, 220, yPosition);
      doc.text(checkOut, 300, yPosition);
      doc.text(status, 380, yPosition);
      doc.text(deliveredBy, 450, yPosition);
      doc.text(pickedUpBy, 550, yPosition);

      yPosition += 15;
    });
  }

  private generateChildPDF(doc: PDFDocument, data: any): void {
    const { child, attendances, incidents, activities, observations, startDate, endDate } = data;

    // Start content after header
    let yPosition = 120;

    doc.fontSize(14).text('Child Information:', 50, yPosition, { bold: true });
    yPosition += 20;
    
    doc.fontSize(12).text(`• Name: ${child.firstName} ${child.lastName}`, 50, yPosition);
    yPosition += 15;
    doc.text(`• Birth Date: ${moment(child.birthDate).format('DD/MM/YYYY')}`, 50, yPosition);
    yPosition += 15;
    doc.text(`• Age: ${moment().diff(moment(child.birthDate), 'years')} years old`, 50, yPosition);
    yPosition += 15;
    
    if (child.birthCity) {
      doc.text(`• Birth City: ${child.birthCity}`, 50, yPosition);
      yPosition += 15;
    }
    
    if (child.address) {
      doc.text(`• Address: ${child.address}`, 50, yPosition);
      yPosition += 15;
    }
    
    yPosition += 10;

    const totalDays = moment(endDate).diff(moment(startDate), 'days') + 1;
    const attendanceDays = attendances.length;
    const attendanceRate = totalDays > 0 ? ((attendanceDays / totalDays) * 100).toFixed(1) : '0';
    
    doc.fontSize(14).text('Attendance Summary:', 50, yPosition, { bold: true });
    yPosition += 20;
    
    doc.fontSize(12).text(`• Total days in period: ${totalDays}`, 50, yPosition);
    yPosition += 15;
    doc.text(`• Days attended: ${attendanceDays}`, 50, yPosition);
    yPosition += 15;
    doc.text(`• Attendance rate: ${attendanceRate}%`, 50, yPosition);
    yPosition += 25;

    if (incidents.length > 0) {
      doc.fontSize(14).text('Reported Incidents:', 50, yPosition, { bold: true });
      yPosition += 20;

      incidents.forEach((incident) => {
        if (yPosition > doc.page.height - 100) {
          doc.addPage();
          yPosition = 120;
        }

        const date = moment(incident.incidentDate).format('DD/MM/YYYY HH:mm');
        doc.fontSize(12).text(`${date} - ${incident.title}`, 50, yPosition, { bold: true });
        yPosition += 15;
        
        doc.fontSize(10).text(`Type: ${incident.incidentType.name}`, 50, yPosition);
        yPosition += 12;
        
        if (incident.location) {
          doc.text(`Location: ${incident.location}`, 50, yPosition);
          yPosition += 12;
        }
        
        doc.text(`Description: ${incident.description}`, 50, yPosition);
        yPosition += 12;
        
        if (incident.actionTaken) {
          doc.text(`Action taken: ${incident.actionTaken}`, 50, yPosition);
          yPosition += 12;
        }
        
        yPosition += 10;
      });
    }

    if (activities.length > 0) {
      if (yPosition > doc.page.height - 150) {
        doc.addPage();
        yPosition = 120;
      }

      doc.fontSize(14).text('Daily Activities:', 50, yPosition, { bold: true });
      yPosition += 20;

      const activitySummary = activities.reduce((acc, activity) => {
        if (!acc[activity.activityType]) {
          acc[activity.activityType] = 0;
        }
        acc[activity.activityType]++;
        return acc;
      }, {});

      Object.entries(activitySummary).forEach(([type, count]) => {
        doc.fontSize(12).text(`• ${this.getActivityTypeName(type)}: ${count} times`, 50, yPosition);
        yPosition += 15;
      });
    }
  }

  private generatePaymentAlertsPDF(doc: PDFDocument, data: any): void {
    const { childrenWithAlerts } = data;

    // Start content after header
    let yPosition = 120;

    doc.fontSize(14).text('Summary:', 50, yPosition, { bold: true });
    yPosition += 20;
    
    doc.fontSize(12).text(`• Total children with payment alerts: ${childrenWithAlerts.length}`, 50, yPosition);
    yPosition += 25;

    if (childrenWithAlerts.length === 0) {
      doc.fontSize(12).text('No children with active payment alerts.', 50, yPosition, { align: 'center' });
    } else {
      doc.fontSize(14).text('Children with Payment Alerts:', 50, yPosition, { bold: true });
      yPosition += 25;

      // Table headers
      doc.fontSize(10).text('Child', 50, yPosition, { bold: true });
      doc.text('Parent/Guardian', 200, yPosition, { bold: true });
      doc.text('Phone', 400, yPosition, { bold: true });
      doc.text('Email', 550, yPosition, { bold: true });

      // Draw line under headers
      doc.moveTo(50, yPosition + 15).lineTo(750, yPosition + 15).stroke();
      yPosition += 25;

      const pageHeight = doc.page.height - 80;

      childrenWithAlerts.forEach((child) => {
        if (yPosition > pageHeight) {
          doc.addPage();
          yPosition = 120;
        }

        const childName = `${child.firstName} ${child.lastName}`;
        const primaryParent = child.parentChildRelationships.find(pcr => pcr.isPrimary);
        const parentName = primaryParent ? `${primaryParent.parent.firstName} ${primaryParent.parent.lastName}` : 'Not assigned';
        const parentPhone = primaryParent?.parent.phone || 'Not available';
        const parentEmail = primaryParent?.parent.email || 'Not available';

        doc.fontSize(9).text(childName, 50, yPosition);
        doc.text(parentName, 200, yPosition);
        doc.text(parentPhone, 400, yPosition);
        doc.text(parentEmail, 550, yPosition);

        yPosition += 15;
      });
    }
  }
}