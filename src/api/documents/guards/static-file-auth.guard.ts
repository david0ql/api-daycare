import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync, statSync } from 'fs';
import { UsersEntity } from 'src/entities/users.entity';
import { DocumentsEntity } from 'src/entities/documents.entity';
import envVars from 'src/config/env';

@Injectable()
export class StaticFileAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(DocumentsEntity)
    private readonly documentsRepository: Repository<DocumentsEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.substring(7);
      
      // Verify JWT token
      const payload = this.jwtService.verify(token, { secret: envVars.JWT_SECRET });
      
      // Get user from database
      const user = await this.usersRepository.findOne({
        where: { id: payload.id },
        relations: ['role'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Extract filename from URL params
      const filename = request.params.filename;
      if (!filename) {
        throw new NotFoundException('Filename not provided');
      }

      // Find document by filename
      const document = await this.documentsRepository.findOne({
        where: { filename },
        relations: ['child', 'child.parentChildRelationships'],
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Check access permissions
      if (user.role.name === 'parent') {
        // Parents can only access documents for their children
        const hasAccess = document.child.parentChildRelationships.some(
          pcr => pcr.parentId === user.id
        );
        
        if (!hasAccess) {
          throw new ForbiddenException('Access denied to this document');
        }
      }
      // Educators and administrators have full access

      // Check if file exists
      const filePath = document.filePath;
      if (!existsSync(filePath)) {
        throw new NotFoundException('File not found on disk');
      }

      // Get file stats
      const stats = statSync(filePath);
      
      // Set appropriate headers
      response.set({
        'Content-Type': document.mimeType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        'Last-Modified': stats.mtime.toUTCString(),
        'ETag': `"${document.id}-${stats.mtime.getTime()}"`,
      });

      // Handle conditional requests
      const ifNoneMatch = request.headers['if-none-match'];
      const ifModifiedSince = request.headers['if-modified-since'];

      if (ifNoneMatch && ifNoneMatch === `"${document.id}-${stats.mtime.getTime()}"`) {
        response.status(304).end();
        return false;
      }

      if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
        response.status(304).end();
        return false;
      }

      // Add file info to request for the controller
      request.authenticatedUser = user;
      request.documentInfo = {
        id: document.id,
        originalFilename: document.originalFilename,
        mimeType: document.mimeType,
        filePath,
        fileSize: stats.size,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || 
          error instanceof ForbiddenException || 
          error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
