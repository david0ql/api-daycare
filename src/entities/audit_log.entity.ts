import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UsersEntity } from "./users.entity";

@Index("idx_user", ["userId"], {})
@Index("idx_action", ["actionType"], {})
@Index("idx_table", ["tableName"], {})
@Index("idx_created_at", ["createdAt"], {})
@Entity("audit_log", { schema: "daycare_db" })
export class AuditLogEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "user_id", nullable: true, unsigned: true })
  userId: number | null;

  @Column("varchar", { name: "action_type", length: 100 })
  actionType: string;

  @Column("varchar", { name: "table_name", length: 100 })
  tableName: string;

  @Column("int", { name: "record_id", nullable: true, unsigned: true })
  recordId: number | null;

  @Column("longtext", { name: "old_values", nullable: true })
  oldValues: string | null;

  @Column("longtext", { name: "new_values", nullable: true })
  newValues: string | null;

  @Column("varchar", { name: "ip_address", nullable: true, length: 45 })
  ipAddress: string | null;

  @Column("text", { name: "user_agent", nullable: true })
  userAgent: string | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => UsersEntity, (users) => users.auditLogs, {
    onDelete: "SET NULL",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: UsersEntity;
}
