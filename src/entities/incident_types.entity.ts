import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IncidentsEntity } from "./incidents.entity";

@Index("name", ["name"], { unique: true })
@Entity("incident_types", { schema: "daycare_db" })
export class IncidentTypesEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("enum", {
    name: "severity_level",
    enum: ["low", "medium", "high", "critical"],
  })
  severityLevel: "low" | "medium" | "high" | "critical";

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(() => IncidentsEntity, (incidents) => incidents.incidentType)
  incidents: IncidentsEntity[];
}
