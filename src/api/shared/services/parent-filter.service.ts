import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';

@Injectable()
export class ParentFilterService {
  constructor(
    @InjectRepository(ParentChildRelationshipsEntity)
    private readonly parentChildRelationshipsRepository: Repository<ParentChildRelationshipsEntity>,
  ) {}

  /**
   * Get all child IDs associated with a parent user
   * @param parentId - The parent user ID
   * @returns Promise<number[]> - Array of child IDs
   */
  async getParentChildIds(parentId: number): Promise<number[]> {
    const relationships = await this.parentChildRelationshipsRepository.find({
      where: { parentId },
      select: ['childId'],
    });
    return relationships.map((r) => r.childId);
  }

  /**
   * Check if a parent has access to a specific child
   * @param parentId - The parent user ID
   * @param childId - The child ID to check
   * @returns Promise<boolean> - True if parent has access, false otherwise
   */
  async hasAccessToChild(parentId: number, childId: number): Promise<boolean> {
    const relationship = await this.parentChildRelationshipsRepository.findOne({
      where: { parentId, childId },
    });
    return !!relationship;
  }
}
