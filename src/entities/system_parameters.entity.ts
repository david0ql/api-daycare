import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UsersEntity } from "./users.entity";

@Index("parameter_key", ["parameterKey"], { unique: true })
@Index("updated_by", ["updatedBy"], {})
@Index("idx_key", ["parameterKey"], {})
@Entity("system_parameters", { schema: "daycare_db" })
export class SystemParametersEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "parameter_key", unique: true, length: 100 })
  parameterKey: string;

  @Column("text", { name: "parameter_value" })
  parameterValue: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("int", { name: "updated_by", nullable: true, unsigned: true })
  updatedBy: number | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @ManyToOne(() => UsersEntity, (users) => users.systemParameters, {
    onDelete: "SET NULL",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: UsersEntity;
}
