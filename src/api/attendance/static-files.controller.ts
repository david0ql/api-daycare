import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  NotFoundException,
  Query,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TokenQueryGuard } from './guards/token-query.guard';

@Controller('uploads')
export class StaticFilesController {
  @Get('activity-photos/:filename')
  async getActivityPhoto(
    @Param('filename') filename: string, 
    @Query('token') token: string,
    @Res() res: Response
  ) {
    console.log('StaticFilesController - Token from query:', token);
    
    // Validate token manually
    if (!token) {
      throw new UnauthorizedException('Token required');
    }

    // Here you would validate the JWT token manually
    // For now, we'll just check if it exists
    if (!token.startsWith('eyJ')) {
      throw new UnauthorizedException('Invalid token format');
    }
    
    const filePath = join(process.cwd(), 'uploads', 'activity-photos', filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get('incident-attachments/:filename')
  async getIncidentAttachment(
    @Param('filename') filename: string, 
    @Query('token') token: string,
    @Res() res: Response
  ) {
    console.log('StaticFilesController - Token from query:', token);
    
    // Validate token manually
    if (!token) {
      throw new UnauthorizedException('Token required');
    }

    // Here you would validate the JWT token manually
    // For now, we'll just check if it exists
    if (!token.startsWith('eyJ')) {
      throw new UnauthorizedException('Invalid token format');
    }
    
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
