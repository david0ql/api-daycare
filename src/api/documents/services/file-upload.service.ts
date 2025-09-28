import { Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';
import moment from 'moment';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'documents');

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
    childId: number,
    documentTypeId: number,
  ): Promise<{
    filename: string;
    originalFilename: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }> {
    try {
      console.log('🔍 FileUploadService - File object:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer,
        hasPath: !!file.path,
        bufferLength: file.buffer?.length,
        path: file.path
      });

      // Generate unique filename
      const fileExtension = this.getFileExtension(file.originalname);
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const filePath = join(this.uploadPath, uniqueFilename);

      // Handle different Multer storage configurations
      if (file.buffer) {
        // Memory storage - file is in buffer
        console.log('🔍 Using buffer storage');
        writeFileSync(filePath, file.buffer);
      } else if (file.path) {
        // Disk storage - file is already saved to temp location
        console.log('🔍 Using disk storage, copying from:', file.path);
        copyFileSync(file.path, filePath);
        // Clean up temporary file
        unlinkSync(file.path);
        console.log('🔍 Temporary file cleaned up');
      } else {
        throw new Error('No file data available (neither buffer nor path)');
      }

      console.log('🔍 File saved successfully to:', filePath);

      return {
        filename: uniqueFilename,
        originalFilename: file.originalname,
        filePath: filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      console.error('🔍 FileUploadService error:', error);
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

  generateExpirationDate(retentionDays: number | null): Date | null {
    if (!retentionDays) {
      return null;
    }
    return moment().add(retentionDays, 'days').toDate();
  }

  getUploadPath(): string {
    return this.uploadPath;
  }

  getFileUrl(filename: string): string {
    return `/uploads/documents/${filename}`;
  }
}
