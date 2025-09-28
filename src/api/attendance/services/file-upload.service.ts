import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    const directories = [
      'activity-photos',
      'incident-attachments',
      'children-profiles',
      'pickup-persons',
    ];

    directories.forEach(dir => {
      const dirPath = path.join(this.uploadsDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  async saveFile(
    file: Express.Multer.File,
    subdirectory: string,
    prefix?: string
  ): Promise<{ filename: string; filePath: string }> {
    const dirPath = path.join(this.uploadsDir, subdirectory);
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const filename = prefix 
      ? `${prefix}-${timestamp}-${randomSuffix}${fileExtension}`
      : `${timestamp}-${randomSuffix}${fileExtension}`;
    
    const filePath = path.join(dirPath, filename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename,
      filePath: filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getFileUrl(filePath: string): string {
    return `/api/uploads${filePath}`;
  }
}
