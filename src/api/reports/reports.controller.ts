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
import type { Response } from 'express';
import moment from 'moment';
import { ReportsService } from './reports.service';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { ChildReportDto } from './dto/child-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('reports')
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
    
    const { startDate, endDate } = attendanceReportDto;
    const filename = `attendance-report-${startDate}-to-${endDate}.pdf`;
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
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
    
    const { startDate, endDate } = childReportDto;
    const filename = `child-${childId}-report-${startDate}-to-${endDate}.pdf`;
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
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
    
    const currentDate = moment().format('YYYY-MM-DD');
    const filename = `payment-alerts-report-${currentDate}.pdf`;
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Post('attendance/weekly')
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
  async generateWeeklyAttendanceReport(
    @Res() response: Response,
    @Body() attendanceReportDto?: AttendanceReportDto,
  ): Promise<void> {
    // Use provided dates or default to current week
    const startDate = attendanceReportDto?.startDate || moment().startOf('week').format('YYYY-MM-DD');
    const endDate = attendanceReportDto?.endDate || moment().endOf('week').format('YYYY-MM-DD');
    
    const reportDto: AttendanceReportDto = {
      startDate,
      endDate,
    };
    
    const pdfBuffer = await this.reportsService.generateAttendanceReport(reportDto);
    
    const filename = `weekly-attendance-report-${startDate}-to-${endDate}.pdf`;
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Post('attendance/monthly')
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
  async generateMonthlyAttendanceReport(
    @Res() response: Response,
    @Body() attendanceReportDto?: AttendanceReportDto,
  ): Promise<void> {
    // Use provided dates or default to current month
    const startDate = attendanceReportDto?.startDate || moment().startOf('month').format('YYYY-MM-DD');
    const endDate = attendanceReportDto?.endDate || moment().endOf('month').format('YYYY-MM-DD');
    
    const reportDto: AttendanceReportDto = {
      startDate,
      endDate,
    };
    
    const pdfBuffer = await this.reportsService.generateAttendanceReport(reportDto);
    
    const filename = `monthly-attendance-report-${startDate}-to-${endDate}.pdf`;
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }

  @Post('child/:childId/monthly')
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
    @Body() childReportDto?: Omit<ChildReportDto, 'childId'>,
  ): Promise<void> {
    // Use provided dates or default to current month
    const startDate = childReportDto?.startDate || moment().startOf('month').format('YYYY-MM-DD');
    const endDate = childReportDto?.endDate || moment().endOf('month').format('YYYY-MM-DD');
    
    const reportDto: ChildReportDto = {
      childId,
      startDate,
      endDate,
    };
    
    const pdfBuffer = await this.reportsService.generateChildReport(reportDto);
    
    const filename = `child-${childId}-monthly-report-${startDate}-to-${endDate}.pdf`;
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.setHeader('Content-Length', pdfBuffer.length);
    
    response.send(pdfBuffer);
  }
}