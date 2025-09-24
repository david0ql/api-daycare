import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { StreamableFile } from '@nestjs/common';
import { StaticFileAuthGuard } from './guards/static-file-auth.guard';

@ApiTags('Static Files')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('static/files')
export class StaticFilesController {
  constructor() {}

  @Get('documents/:filename')
  @UseGuards(StaticFileAuthGuard)
  @ApiOperation({ 
    summary: 'Serve document file with authentication',
    description: 'Serves a document file with JWT authentication. Supports caching and conditional requests.'
  })
  @ApiParam({
    name: 'filename',
    description: 'The unique filename of the document',
    example: '550e8400-e29b-41d4-a716-446655440000.pdf'
  })
  @ApiResponse({
    status: 200,
    description: 'File served successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
    headers: {
      'Content-Type': {
        description: 'MIME type of the file',
        schema: { type: 'string' }
      },
      'Content-Length': {
        description: 'Size of the file in bytes',
        schema: { type: 'string' }
      },
      'Cache-Control': {
        description: 'Cache control directive',
        schema: { type: 'string' }
      },
      'Last-Modified': {
        description: 'Last modification date',
        schema: { type: 'string' }
      },
      'ETag': {
        description: 'Entity tag for caching',
        schema: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 304,
    description: 'File not modified (cached)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to this document',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async serveDocument(
    @Param('filename') filename: string,
    @Req() req: Request & { documentInfo: any },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, originalFilename } = req.documentInfo;

    // Create readable stream from file
    const fileStream = createReadStream(filePath);

    // Set Content-Disposition header for proper filename
    res.setHeader('Content-Disposition', `inline; filename="${originalFilename}"`);

    return new StreamableFile(fileStream);
  }

  @Get('documents/:filename/download')
  @UseGuards(StaticFileAuthGuard)
  @ApiOperation({ 
    summary: 'Download document file with authentication',
    description: 'Downloads a document file with JWT authentication. Forces download instead of inline display.'
  })
  @ApiParam({
    name: 'filename',
    description: 'The unique filename of the document',
    example: '550e8400-e29b-41d4-a716-446655440000.pdf'
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to this document',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async downloadDocument(
    @Param('filename') filename: string,
    @Req() req: Request & { documentInfo: any },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, originalFilename } = req.documentInfo;

    // Create readable stream from file
    const fileStream = createReadStream(filePath);

    // Set Content-Disposition header to force download
    res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);

    return new StreamableFile(fileStream);
  }
}
