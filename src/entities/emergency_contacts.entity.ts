import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChildrenEntity } from "./children.entity";

@Index("idx_child", ["childId"], {})
@Index("idx_primary", ["isPrimary"], {})
@Entity("emergency_contacts", { schema: "daycare_db" })
export class EmergencyContactsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("varchar", { name: "name", length: 100 })
  name: string;

  @Column("varchar", { name: "relationship", length: 50 })
  relationship: string;

  @Column("varchar", { name: "phone", length: 20 })
  phone: string;

  @Column("varchar", { name: "email", nullable: true, length: 255 })
  email: string | null;

  @Column("tinyint", {
    name: "is_primary",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isPrimary: boolean | null;

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

  @ManyToOne(() => ChildrenEntity, (children) => children.emergencyContacts, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;
}
