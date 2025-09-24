import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChildrenEntity } from "./children.entity";
import { DailyAttendanceEntity } from "./daily_attendance.entity";
import { UsersEntity } from "./users.entity";

@Index("created_by", ["createdBy"], {})
@Index("idx_child", ["childId"], {})
@Index("idx_attendance", ["attendanceId"], {})
@Index("idx_mood", ["mood"], {})
@Entity("daily_observations", { schema: "daycare_db" })
export class DailyObservationsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("int", { name: "attendance_id", unsigned: true })
  attendanceId: number;

  @Column("enum", {
    name: "mood",
    enum: ["happy", "sad", "tired", "energetic", "calm", "cranky", "neutral"],
  })
  mood: "happy" | "sad" | "tired" | "energetic" | "calm" | "cranky" | "neutral";

  @Column("text", { name: "general_observations", nullable: true })
  generalObservations: string | null;

  @Column("int", { name: "created_by", unsigned: true })
  createdBy: number;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => ChildrenEntity, (children) => children.dailyObservations, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;

  @ManyToOne(
    () => DailyAttendanceEntity,
    (dailyAttendance) => dailyAttendance.dailyObservations,
    { onDelete: "CASCADE", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "attendance_id", referencedColumnName: "id" }])
  attendance: DailyAttendanceEntity;

  @ManyToOne(() => UsersEntity, (users) => users.dailyObservations, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: UsersEntity;
}
