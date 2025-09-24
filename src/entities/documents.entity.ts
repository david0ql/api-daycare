import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChildrenEntity } from "./children.entity";
import { DocumentTypesEntity } from "./document_types.entity";
import { UsersEntity } from "./users.entity";

@Index("idx_child", ["childId"], {})
@Index("idx_type", ["documentTypeId"], {})
@Index("idx_uploaded_by", ["uploadedBy"], {})
@Index("idx_expires_at", ["expiresAt"], {})
@Entity("documents", { schema: "daycare_db" })
export class DocumentsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("int", { name: "document_type_id", unsigned: true })
  documentTypeId: number;

  @Column("varchar", { name: "filename", length: 255 })
  filename: string;

  @Column("varchar", { name: "original_filename", length: 255 })
  originalFilename: string;

  @Column("varchar", { name: "file_path", length: 500 })
  filePath: string;

  @Column("int", { name: "file_size", unsigned: true })
  fileSize: number;

  @Column("varchar", { name: "mime_type", length: 100 })
  mimeType: string;

  @Column("int", { name: "uploaded_by", unsigned: true })
  uploadedBy: number;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp", { name: "expires_at", nullable: true })
  expiresAt: Date | null;

  @ManyToOne(() => ChildrenEntity, (children) => children.documents, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;

  @ManyToOne(() => DocumentTypesEntity, (documentTypes) => documentTypes.documents, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "document_type_id", referencedColumnName: "id" }])
  documentType: DocumentTypesEntity;

  @ManyToOne(() => UsersEntity, (users) => users.documents, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
  uploadedBy2: UsersEntity;
}
