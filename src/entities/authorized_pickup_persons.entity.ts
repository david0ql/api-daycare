import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DailyAttendanceEntity } from "./daily_attendance.entity";
import { ChildrenEntity } from "./children.entity";

@Index("idx_child", ["childId"], {})
@Entity("authorized_pickup_persons", { schema: "daycare_db" })
export class AuthorizedPickupPersonsEntity {
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

  @Column("varchar", { name: "photo", nullable: true, length: 500 })
  photo: string | null;

  @Column("varchar", { name: "id_document", nullable: true, length: 50 })
  idDocument: string | null;

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

  @OneToMany(
    () => DailyAttendanceEntity,
    (dailyAttendance) => dailyAttendance.deliveredBy2
  )
  dailyAttendances: DailyAttendanceEntity[];

  @OneToMany(
    () => DailyAttendanceEntity,
    (dailyAttendance) => dailyAttendance.pickedUpBy2
  )
  dailyAttendances2: DailyAttendanceEntity[];

  @ManyToOne(() => ChildrenEntity, (children) => children.authorizedPickupPersons, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;
}
