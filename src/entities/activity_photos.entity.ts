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

@Index("idx_child", ["childId"], {})
@Index("idx_attendance", ["attendanceId"], {})
@Index("idx_uploaded_by", ["uploadedBy"], {})
@Entity("activity_photos", { schema: "daycare_db" })
export class ActivityPhotosEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("int", { name: "attendance_id", unsigned: true })
  attendanceId: number;

  @Column("varchar", { name: "filename", length: 255 })
  filename: string;

  @Column("varchar", { name: "file_path", length: 500 })
  filePath: string;

  @Column("text", { name: "caption", nullable: true })
  caption: string | null;

  @Column("int", { name: "uploaded_by", unsigned: true })
  uploadedBy: number;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => ChildrenEntity, (children) => children.activityPhotos, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;

  @ManyToOne(
    () => DailyAttendanceEntity,
    (dailyAttendance) => dailyAttendance.activityPhotos,
    { onDelete: "CASCADE", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "attendance_id", referencedColumnName: "id" }])
  attendance: DailyAttendanceEntity;

  @ManyToOne(() => UsersEntity, (users) => users.activityPhotos, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
  uploadedBy2: UsersEntity;
}
