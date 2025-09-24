import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DocumentsEntity } from "./documents.entity";

@Index("name", ["name"], { unique: true })
@Entity("document_types", { schema: "daycare_db" })
export class DocumentTypesEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("int", {
    name: "retention_days",
    nullable: true,
    unsigned: true,
    default: () => "'365'",
  })
  retentionDays: number | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(() => DocumentsEntity, (documents) => documents.documentType)
  documents: DocumentsEntity[];
}
