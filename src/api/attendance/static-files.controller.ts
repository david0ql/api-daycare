import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaticFilesController {
  @Get('activity-photos/:filename')
  @Roles('administrator', 'educator', 'parent')
  async getActivityPhoto(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'activity-photos', filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get('incident-attachments/:filename')
  @Roles('administrator', 'educator', 'parent')
  async getIncidentAttachment(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'incident-attachments', filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get('children-profiles/:filename')
  @Roles('administrator', 'educator', 'parent')
  async getChildProfile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'children-profiles', filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get('pickup-persons/:filename')
  @Roles('administrator', 'educator', 'parent')
  async getPickupPersonPhoto(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'pickup-persons', filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
