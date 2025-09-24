import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as moment from 'moment';
import { ReportsService } from './reports.service';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { ChildReportDto } from './dto/child-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('attendance')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Generate attendance report PDF' })
  @ApiResponse({
    status: 200,
    description: 'Attendance report generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generateAttendanceReport(
    @Res() response: Response,
    @Body() attendanceReportDto: AttendanceReportDto,
  ): Promise<void> {
    const pdfBuffer = await this.reportsService.generateAttendanceReport(attendanceReportDto);
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename="attendance-report.pdf"');
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Post('child/:childId')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Generate individual child report PDF' })
  @ApiResponse({
    status: 200,
    description: 'Child report generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generateChildReport(
    @Res() response: Response,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() childReportDto: Omit<ChildReportDto, 'childId'>,
  ): Promise<void> {
    const fullDto = { ...childReportDto, childId };
    const pdfBuffer = await this.reportsService.generateChildReport(fullDto);
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="child-${childId}-report.pdf"`);
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Get('payment-alerts')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Generate payment alerts report PDF' })
  @ApiResponse({
    status: 200,
    description: 'Payment alerts report generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generatePaymentAlertsReport(@Res() response: Response): Promise<void> {
    const pdfBuffer = await this.reportsService.generatePaymentAlertsReport();
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename="payment-alerts-report.pdf"');
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Get('attendance/weekly')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Generate weekly attendance report PDF' })
  @ApiResponse({
    status: 200,
    description: 'Weekly attendance report generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generateWeeklyAttendanceReport(@Res() response: Response): Promise<void> {
    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
    const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
    
    const attendanceReportDto: AttendanceReportDto = {
      startDate: startOfWeek,
      endDate: endOfWeek,
    };
    
    const pdfBuffer = await this.reportsService.generateAttendanceReport(attendanceReportDto);
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename="weekly-attendance-report.pdf"');
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Get('attendance/monthly')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Generate monthly attendance report PDF' })
  @ApiResponse({
    status: 200,
    description: 'Monthly attendance report generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generateMonthlyAttendanceReport(@Res() response: Response): Promise<void> {
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
    
    const attendanceReportDto: AttendanceReportDto = {
      startDate: startOfMonth,
      endDate: endOfMonth,
    };
    
    const pdfBuffer = await this.reportsService.generateAttendanceReport(attendanceReportDto);
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename="monthly-attendance-report.pdf"');
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Get('child/:childId/monthly')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Generate monthly child report PDF' })
  @ApiResponse({
    status: 200,
    description: 'Monthly child report generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generateMonthlyChildReport(
    @Res() response: Response,
    @Param('childId', ParseIntPipe) childId: number,
  ): Promise<void> {
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
    
    const childReportDto: ChildReportDto = {
      childId,
      startDate: startOfMonth,
      endDate: endOfMonth,
    };
    
    const pdfBuffer = await this.reportsService.generateChildReport(childReportDto);
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="child-${childId}-monthly-report.pdf"`);
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }
}