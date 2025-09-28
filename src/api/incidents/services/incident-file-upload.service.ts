import { Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class IncidentFileUploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'incident-attachments');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
    incidentId: number,
  ): Promise<{
    filename: string;
    originalFilename: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }> {
    try {
      console.log('🔍 IncidentFileUploadService - File received:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer,
        hasPath: !!file.path,
        hasStream: !!file.stream
      });

      // Generate unique filename
      const fileExtension = this.getFileExtension(file.originalname);
      const uniqueFilename = `incident-${incidentId}-${randomUUID()}${fileExtension}`;
      const finalFilePath = join(this.uploadPath, uniqueFilename);

      // Handle different Multer configurations
      if (file.buffer) {
        // In-memory storage
        console.log('🔍 Using file.buffer (in-memory storage)');
        writeFileSync(finalFilePath, file.buffer);
      } else if (file.path) {
        // Disk storage - copy from temp location to final location
        console.log('🔍 Using file.path (disk storage)');
        copyFileSync(file.path, finalFilePath);
        // Delete the temporary file
        unlinkSync(file.path);
      } else if (file.stream) {
        // Stream storage
        console.log('🔍 Using file.stream (stream storage)');
        const writeStream = require('fs').createWriteStream(finalFilePath);
        file.stream.pipe(writeStream);
        
        await new Promise<void>((resolve, reject) => {
          writeStream.on('finish', () => resolve());
          writeStream.on('error', reject);
        });
      } else {
        throw new Error('No valid file data found (buffer, path, or stream)');
      }

      console.log('🔍 File saved successfully:', finalFilePath);

      return {
        filename: uniqueFilename,
        originalFilename: file.originalname,
        filePath: finalFilePath,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      console.error('🔍 Error saving file:', error);
      throw new BadRequestException(`Failed to save file: ${error.message}`);
    }
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }

  getFileMimeTypeCategory(mimeType: string): 'image' | 'document' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    return 'document';
  }

  getUploadPath(): string {
    return this.uploadPath;
  }

  getFileUrl(filename: string): string {
    return `/uploads/incident-attachments/${filename}`;
  }
}
