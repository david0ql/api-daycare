import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLogEntity } from 'src/entities/notification_logs.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectRepository(NotificationLogEntity)
    private readonly repo: Repository<NotificationLogEntity>,
  ) {}

  async createMany(
    childId: number,
    parentIds: number[],
    title: string,
    body: string,
    type: string,
    entityId?: number,
  ): Promise<void> {
    if (parentIds.length === 0) return;
    const logs = parentIds.map((parentId) =>
      this.repo.create({ childId, parentId, title, body, type, entityId: entityId ?? null }),
    );
    await this.repo.save(logs);
  }

  async findByParent(
    parentId: number,
    page: number = 1,
    take: number = 20,
  ): Promise<{ data: NotificationLogEntity[]; total: number; unread: number }> {
    const skip = (page - 1) * take;

    const [data, total] = await this.repo.findAndCount({
      where: { parentId },
      relations: ['child'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    const unread = await this.repo.count({ where: { parentId, isRead: false } });

    return { data, total, unread };
  }

  async getUnreadCount(parentId: number): Promise<number> {
    return this.repo.count({ where: { parentId, isRead: false } });
  }

  async markRead(id: number, parentId: number): Promise<void> {
    await this.repo.update({ id, parentId }, { isRead: true });
  }

  async markAllRead(parentId: number): Promise<void> {
    await this.repo.update({ parentId, isRead: false }, { isRead: true });
  }
}
