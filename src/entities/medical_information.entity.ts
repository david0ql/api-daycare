import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChildrenEntity } from "./children.entity";

@Index("child_id", ["childId"], { unique: true })
@Entity("medical_information", { schema: "daycare_db" })
export class MedicalInformationEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unique: true, unsigned: true })
  childId: number;

  @Column("text", { name: "allergies", nullable: true })
  allergies: string | null;

  @Column("text", { name: "medications", nullable: true })
  medications: string | null;

  @Column("varchar", { name: "insurance_company", nullable: true, length: 100 })
  insuranceCompany: string | null;

  @Column("varchar", { name: "insurance_number", nullable: true, length: 50 })
  insuranceNumber: string | null;

  @Column("varchar", { name: "pediatrician_name", nullable: true, length: 100 })
  pediatricianName: string | null;

  @Column("varchar", { name: "pediatrician_phone", nullable: true, length: 20 })
  pediatricianPhone: string | null;

  @Column("text", { name: "additional_notes", nullable: true })
  additionalNotes: string | null;

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

  @OneToOne(() => ChildrenEntity, (children) => children.medicalInformation, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;
}
