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
    console.log('FileUploadService - Received file:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      hasBuffer: !!file?.buffer,
      hasPath: !!file?.path,
      hasStream: !!file?.stream,
      path: file?.path,
      keys: Object.keys(file || {})
    });

    if (!file) {
      throw new Error('No file provided to FileUploadService');
    }

    if (!file.buffer && !file.path && !file.stream) {
      throw new Error('File has no buffer, path, or stream property');
    }

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

    // Save file - handle different Multer configurations
    if (file.buffer) {
      // File is in memory (no dest configured)
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
      // File was saved to disk (dest configured) - move it to our desired location
      fs.copyFileSync(file.path, filePath);
      // Clean up the temporary file
      fs.unlinkSync(file.path);
    } else if (file.stream) {
      // File is a stream
      const writeStream = fs.createWriteStream(filePath);
      file.stream.pipe(writeStream);
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
      });
    } else {
      throw new Error('File has no buffer, path, or stream to save');
    }

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
