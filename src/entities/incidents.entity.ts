import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChildrenEntity } from "./children.entity";
import { IncidentTypesEntity } from "./incident_types.entity";
import { UsersEntity } from "./users.entity";
import { IncidentAttachmentsEntity } from "./incident_attachments.entity";

@Index("idx_child", ["childId"], {})
@Index("idx_type", ["incidentTypeId"], {})
@Index("idx_date", ["incidentDate"], {})
@Index("idx_reported_by", ["reportedBy"], {})
@Entity("incidents", { schema: "daycare_db" })
export class IncidentsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("int", { name: "incident_type_id", unsigned: true })
  incidentTypeId: number;

  @Column("varchar", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("timestamp", { name: "incident_date" })
  incidentDate: Date;

  @Column("varchar", { name: "location", nullable: true, length: 255 })
  location: string | null;

  @Column("text", { name: "action_taken", nullable: true })
  actionTaken: string | null;

  @Column("tinyint", {
    name: "parent_notified",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  parentNotified: boolean | null;

  @Column("timestamp", { name: "parent_notified_at", nullable: true })
  parentNotifiedAt: Date | null;

  @Column("int", { name: "reported_by", unsigned: true })
  reportedBy: number;

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

  @ManyToOne(() => ChildrenEntity, (children) => children.incidents, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;

  @ManyToOne(() => IncidentTypesEntity, (incidentTypes) => incidentTypes.incidents, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "incident_type_id", referencedColumnName: "id" }])
  incidentType: IncidentTypesEntity;

  @ManyToOne(() => UsersEntity, (users) => users.incidents, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "reported_by", referencedColumnName: "id" }])
  reportedBy2: UsersEntity;

  @OneToMany(
    () => IncidentAttachmentsEntity,
    (incidentAttachments) => incidentAttachments.incident
  )
  incidentAttachments: IncidentAttachmentsEntity[];
}
