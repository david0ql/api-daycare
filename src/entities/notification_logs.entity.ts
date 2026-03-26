import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { ChildrenEntity } from './children.entity';

@Index('idx_notif_parent', ['parentId'], {})
@Index('idx_notif_child', ['childId'], {})
@Index('idx_notif_is_read', ['isRead'], {})
@Entity('notification_logs', { schema: 'daycare_db' })
export class NotificationLogEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'child_id', unsigned: true })
  childId: number;

  @Column('int', { name: 'parent_id', unsigned: true })
  parentId: number;

  @Column('varchar', { name: 'title', length: 255 })
  title: string;

  @Column('text', { name: 'body' })
  body: string;

  @Column('varchar', { name: 'type', length: 50, default: 'general' })
  type: string;

  @Column('int', { name: 'entity_id', unsigned: true, nullable: true })
  entityId: number | null;

  @Column('tinyint', { name: 'is_read', width: 1, default: () => "'0'" })
  isRead: boolean;

  @Column('timestamp', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(() => ChildrenEntity, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'child_id', referencedColumnName: 'id' }])
  child: ChildrenEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'parent_id', referencedColumnName: 'id' }])
  parent: UsersEntity;
}
