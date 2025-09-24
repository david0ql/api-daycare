import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IncidentsEntity } from "./incidents.entity";
import { UsersEntity } from "./users.entity";

@Index("uploaded_by", ["uploadedBy"], {})
@Index("idx_incident", ["incidentId"], {})
@Entity("incident_attachments", { schema: "daycare_db" })
export class IncidentAttachmentsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "incident_id", unsigned: true })
  incidentId: number;

  @Column("varchar", { name: "filename", length: 255 })
  filename: string;

  @Column("varchar", { name: "file_path", length: 500 })
  filePath: string;

  @Column("enum", { name: "file_type", enum: ["image", "document"] })
  fileType: "image" | "document";

  @Column("int", { name: "uploaded_by", unsigned: true })
  uploadedBy: number;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => IncidentsEntity, (incidents) => incidents.incidentAttachments, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "incident_id", referencedColumnName: "id" }])
  incident: IncidentsEntity;

  @ManyToOne(() => UsersEntity, (users) => users.incidentAttachments, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
  uploadedBy2: UsersEntity;
}
