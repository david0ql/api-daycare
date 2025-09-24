import { Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
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
      // Generate unique filename
      const fileExtension = this.getFileExtension(file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = join(this.uploadPath, uniqueFilename);

      // Save file to disk
      writeFileSync(filePath, file.buffer);

      return {
        filename: uniqueFilename,
        originalFilename: file.originalname,
        filePath: filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
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
