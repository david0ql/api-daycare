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
@Index("idx_type", ["activityType"], {})
@Index("idx_date", ["timeCompleted"], {})
@Entity("daily_activities", { schema: "daycare_db" })
export class DailyActivitiesEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("int", { name: "attendance_id", unsigned: true })
  attendanceId: number;

  @Column("enum", {
    name: "activity_type",
    enum: [
      "breakfast",
      "lunch",
      "snack",
      "nap",
      "diaper_change",
      "clothing_change",
      "hydration",
      "other",
    ],
  })
  activityType:
    | "breakfast"
    | "lunch"
    | "snack"
    | "nap"
    | "diaper_change"
    | "clothing_change"
    | "hydration"
    | "other";

  @Column("tinyint", {
    name: "completed",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  completed: boolean | null;

  @Column("timestamp", { name: "time_completed", nullable: true })
  timeCompleted: Date | null;

  @Column("text", { name: "notes", nullable: true })
  notes: string | null;

  @Column("int", { name: "created_by", unsigned: true })
  createdBy: number;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => ChildrenEntity, (children) => children.dailyActivities, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;

  @ManyToOne(
    () => DailyAttendanceEntity,
    (dailyAttendance) => dailyAttendance.dailyActivities,
    { onDelete: "CASCADE", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "attendance_id", referencedColumnName: "id" }])
  attendance: DailyAttendanceEntity;

  @ManyToOne(() => UsersEntity, (users) => users.dailyActivities, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: UsersEntity;
}
