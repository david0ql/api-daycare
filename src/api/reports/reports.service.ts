import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import moment from 'moment';
import { join } from 'path';
import PdfPrinter from 'pdfmake';
import type { Content, StyleDictionary, TDocumentDefinitions, BufferOptions, CustomTableLayout } from 'pdfmake/interfaces';
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
  private logo = {
    image: join(process.cwd(), 'src/assets/logo.png'),
    width: 150,
    alignment: 'center' as const,
  };

  private readonly styles: StyleDictionary = {
    header: {
      fontSize: 18,
      bold: true,
      color: '#2c3e50',
      margin: [0, 0, 0, 10],
    },
    subheader: {
      fontSize: 14,
      bold: true,
      color: '#34495e',
      margin: [0, 10, 0, 5],
    },
    tableHeader: {
      fontSize: 10,
      bold: true,
      color: '#ffffff',
      fillColor: '#3498db',
      alignment: 'center',
    },
    tableCell: {
      fontSize: 9,
      color: '#2c3e50',
    },
    footer: {
      fontSize: 8,
      color: '#7f8c8d',
      alignment: 'center',
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
      relations: ['parentChildRelationships', 'parentChildRelationships.parent'],
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .where('attendance.childId = :childId', { childId })
      .andWhere('attendance.attendanceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.attendanceDate', 'DESC')
      .getMany();

    const activities = await this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.photos', 'photos')
      .where('activity.childId = :childId', { childId })
      .andWhere('activity.timeCompleted BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('activity.timeCompleted', 'DESC')
      .getMany();

    const observations = await this.observationsRepository
      .createQueryBuilder('observation')
      .where('observation.childId = :childId', { childId })
      .andWhere('observation.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('observation.createdAt', 'DESC')
      .getMany();

    const incidents = await this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.reportedBy2', 'reportedBy')
      .where('incident.childId = :childId', { childId })
      .andWhere('incident.incidentDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('incident.incidentDate', 'DESC')
      .getMany();

    return this.createPDFDocument('child', {
      child,
      attendances,
      activities,
      observations,
      incidents,
      startDate,
      endDate,
    });
  }

  async generatePaymentAlertsReport(): Promise<Buffer> {
    // Get children with payment alerts (you'll need to implement this logic based on your business rules)
    const childrenWithAlerts = await this.childrenRepository
      .createQueryBuilder('child')
      .leftJoinAndSelect('child.parentChildRelationships', 'pcr')
      .leftJoinAndSelect('pcr.parent', 'parent')
      .where('child.hasPaymentAlert = :hasAlert', { hasAlert: true })
      .getMany();

    return this.createPDFDocument('payment-alerts', { childrenWithAlerts });
  }

  async generateWeeklyAttendanceReport(): Promise<Buffer> {
    const startOfWeek = moment().startOf('week').toDate();
    const endOfWeek = moment().endOf('week').toDate();

    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .where('attendance.attendanceDate BETWEEN :startDate AND :endDate', {
        startDate: startOfWeek,
        endDate: endOfWeek,
      })
      .orderBy('attendance.attendanceDate', 'DESC')
      .getMany();

    return this.createPDFDocument('weekly-attendance', {
      attendances,
      startDate: startOfWeek,
      endDate: endOfWeek,
    });
  }

  async generateMonthlyAttendanceReport(): Promise<Buffer> {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .where('attendance.attendanceDate BETWEEN :startDate AND :endDate', {
        startDate: startOfMonth,
        endDate: endOfMonth,
      })
      .orderBy('attendance.attendanceDate', 'DESC')
      .getMany();

    return this.createPDFDocument('monthly-attendance', {
      attendances,
      startDate: startOfMonth,
      endDate: endOfMonth,
    });
  }

  private async createPDFDocument(type: string, data: any): Promise<Buffer> {
    const fonts = {
      Roboto: {
        normal: 'node_modules/pdfmake/build/vfs_fonts.js',
        bold: 'node_modules/pdfmake/build/vfs_fonts.js',
        italics: 'node_modules/pdfmake/build/vfs_fonts.js',
        bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js',
      },
    };

    const printer = new PdfPrinter(fonts);
    const docDefinition = this.getDocumentDefinition(type, data);
    
    return new Promise((resolve, reject) => {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);

      pdfDoc.end();
    });
  }

  private getDocumentDefinition(type: string, data: any): TDocumentDefinitions {
    const today = moment();
    let title = 'Daycare Report';

    // Customize title based on report type
    switch (type) {
      case 'attendance':
        title = `Attendance Report - ${moment(data.startDate).format('MM/DD/YYYY')} to ${moment(data.endDate).format('MM/DD/YYYY')}`;
        break;
      case 'child':
        title = `Child Report - ${data.child.firstName} ${data.child.lastName}`;
        break;
      case 'payment-alerts':
        title = 'Payment Alerts Report';
        break;
      case 'weekly-attendance':
        title = `Weekly Attendance Report - Week of ${moment(data.startDate).format('MM/DD/YYYY')}`;
        break;
      case 'monthly-attendance':
        title = `Monthly Attendance Report - ${moment(data.startDate).format('MMMM YYYY')}`;
        break;
    }

    const docDefinition: TDocumentDefinitions = {
      styles: this.styles,
      pageMargins: [40, 120, 40, 60],
      pageOrientation: 'landscape',
      pageSize: 'A4',
      header: {
        columns: [
          this.logo,
          {
            text: title,
            style: 'header',
          },
        ],
      },
      footer: {
        text: `© ${today.format('YYYY')} The Children's World. This document is confidential and cannot be shared.`,
        style: 'footer',
      },
      content: this.getContentByType(type, data),
    };

    return docDefinition;
  }

  private getContentByType(type: string, data: any): Content[] {
    switch (type) {
      case 'attendance':
        return this.generateAttendanceContent(data);
      case 'child':
        return this.generateChildContent(data);
      case 'payment-alerts':
        return this.generatePaymentAlertsContent(data);
      case 'weekly-attendance':
        return this.generateWeeklyAttendanceContent(data);
      case 'monthly-attendance':
        return this.generateMonthlyAttendanceContent(data);
      default:
        return [{ text: 'Report not found', style: 'subheader' }];
    }
  }

  private generateAttendanceContent(data: any): Content[] {
    const { attendances, startDate, endDate } = data;
    const content: Content[] = [];

    content.push({
      text: `Report Period: ${moment(startDate).format('MM/DD/YYYY')} - ${moment(endDate).format('MM/DD/YYYY')}`,
      style: 'subheader',
    });

    content.push({
      text: `Total Attendance Records: ${attendances.length}`,
      style: 'subheader',
    });

    if (attendances.length === 0) {
      content.push({
        text: 'No attendance records found for the specified period.',
        style: 'tableCell',
      });
    } else {
      const tableBody = [
        ['Date', 'Child Name', 'Check In', 'Check Out', 'Delivered By', 'Picked Up By', 'Notes'],
      ];

      attendances.forEach((attendance) => {
        tableBody.push([
          moment(attendance.attendanceDate).format('MM/DD/YYYY'),
          `${attendance.child.firstName} ${attendance.child.lastName}`,
          attendance.checkInTime ? moment(attendance.checkInTime).format('HH:mm') : 'Not checked in',
          attendance.checkOutTime ? moment(attendance.checkOutTime).format('HH:mm') : 'Not checked out',
          attendance.deliveredBy ? `${attendance.deliveredBy.firstName} ${attendance.deliveredBy.lastName}` : 'N/A',
          attendance.pickedUpBy ? `${attendance.pickedUpBy.firstName} ${attendance.pickedUpBy.lastName}` : 'N/A',
          attendance.checkInNotes || attendance.checkOutNotes || 'No notes',
        ]);
      });

      content.push({
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*', '*', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
      });
    }

    return content;
  }

  private generateChildContent(data: any): Content[] {
    const { child, attendances, activities, observations, incidents, startDate, endDate } = data;
    const content: Content[] = [];

    // Child Information
    content.push({
      text: 'Child Information',
      style: 'subheader',
    });

    const primaryParent = child.parentChildRelationships.find(pcr => pcr.isPrimary);
    content.push({
      table: {
        widths: ['*', '*'],
        body: [
          ['Name', `${child.firstName} ${child.lastName}`],
          ['Date of Birth', moment(child.dateOfBirth).format('MM/DD/YYYY')],
          ['Primary Parent', primaryParent ? `${primaryParent.parent.firstName} ${primaryParent.parent.lastName}` : 'Not assigned'],
          ['Report Period', `${moment(startDate).format('MM/DD/YYYY')} - ${moment(endDate).format('MM/DD/YYYY')}`],
        ],
      },
      layout: 'lightHorizontalLines',
    });

    // Attendance Summary
    content.push({
      text: 'Attendance Summary',
      style: 'subheader',
    });

    content.push({
      text: `Total Days Attended: ${attendances.length}`,
      style: 'tableCell',
    });

    // Activities
    if (activities.length > 0) {
      content.push({
        text: 'Activities',
        style: 'subheader',
      });

      activities.forEach((activity) => {
        content.push({
          text: `${moment(activity.timeCompleted).format('MM/DD/YYYY')} - ${this.getActivityTypeName(activity.activityType)}`,
          style: 'tableCell',
        });
        if (activity.notes) {
          content.push({
            text: activity.notes,
            style: 'tableCell',
            margin: [20, 0, 0, 5],
          });
        }
      });
    }

    // Observations
    if (observations.length > 0) {
      content.push({
        text: 'Observations',
        style: 'subheader',
      });

      observations.forEach((observation) => {
        content.push({
          text: `${moment(observation.createdAt).format('MM/DD/YYYY')} - Mood: ${observation.mood}`,
          style: 'tableCell',
        });
        if (observation.generalObservations) {
          content.push({
            text: observation.generalObservations,
            style: 'tableCell',
            margin: [20, 0, 0, 5],
          });
        }
      });
    }

    // Incidents
    if (incidents.length > 0) {
      content.push({
        text: 'Incidents',
        style: 'subheader',
      });

      incidents.forEach((incident) => {
        content.push({
          text: `${moment(incident.incidentDate).format('MM/DD/YYYY')} - ${incident.title}`,
          style: 'tableCell',
        });
        if (incident.description) {
          content.push({
            text: incident.description,
            style: 'tableCell',
            margin: [20, 0, 0, 5],
          });
        }
      });
    }

    return content;
  }

  private generatePaymentAlertsContent(data: any): Content[] {
    const { childrenWithAlerts } = data;
    const content: Content[] = [];

    content.push({
      text: 'Summary',
      style: 'subheader',
    });

    content.push({
      text: `Total children with payment alerts: ${childrenWithAlerts.length}`,
      style: 'tableCell',
    });

    if (childrenWithAlerts.length === 0) {
      content.push({
        text: 'No children with active payment alerts.',
        style: 'tableCell',
        alignment: 'center',
      });
    } else {
      content.push({
        text: 'Children with Payment Alerts',
        style: 'subheader',
      });

      const tableBody = [
        ['Child', 'Parent/Guardian', 'Phone', 'Email'],
      ];

      childrenWithAlerts.forEach((child) => {
        const primaryParent = child.parentChildRelationships.find(pcr => pcr.isPrimary);
        const parentName = primaryParent ? `${primaryParent.parent.firstName} ${primaryParent.parent.lastName}` : 'Not assigned';
        const parentPhone = primaryParent?.parent.phone || 'Not available';
        const parentEmail = primaryParent?.parent.email || 'Not available';

        tableBody.push([
          `${child.firstName} ${child.lastName}`,
          parentName,
          parentPhone,
          parentEmail,
        ]);
      });

      content.push({
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
      });
    }

    return content;
  }

  private generateWeeklyAttendanceContent(data: any): Content[] {
    return this.generateAttendanceContent(data);
  }

  private generateMonthlyAttendanceContent(data: any): Content[] {
    return this.generateAttendanceContent(data);
  }

  private getActivityTypeName(type: string): string {
    const types: { [key: string]: string } = {
      'art': 'Art & Crafts',
      'music': 'Music & Dance',
      'outdoor': 'Outdoor Play',
      'story': 'Story Time',
      'meal': 'Meal Time',
      'nap': 'Nap Time',
      'learning': 'Learning Activity',
      'other': 'Other',
    };
    return types[type] || type;
  }
}