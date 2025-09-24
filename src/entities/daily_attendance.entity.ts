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
import { AuthorizedPickupPersonsEntity } from "./authorized_pickup_persons.entity";
import { UsersEntity } from "./users.entity";
import { DailyObservationsEntity } from "./daily_observations.entity";
import { ActivityPhotosEntity } from "./activity_photos.entity";
import { DailyActivitiesEntity } from "./daily_activities.entity";

@Index("unique_child_date", ["childId", "attendanceDate"], { unique: true })
@Index("delivered_by", ["deliveredBy"], {})
@Index("picked_up_by", ["pickedUpBy"], {})
@Index("updated_by", ["updatedBy"], {})
@Index("idx_child_date", ["childId", "attendanceDate"], {})
@Index("idx_date", ["attendanceDate"], {})
@Index("idx_created_by", ["createdBy"], {})
@Entity("daily_attendance", { schema: "daycare_db" })
export class DailyAttendanceEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("date", { name: "attendance_date" })
  attendanceDate: string;

  @Column("timestamp", { name: "check_in_time", nullable: true })
  checkInTime: Date | null;

  @Column("timestamp", { name: "check_out_time", nullable: true })
  checkOutTime: Date | null;

  @Column("int", { name: "delivered_by", nullable: true, unsigned: true })
  deliveredBy: number | null;

  @Column("int", { name: "picked_up_by", nullable: true, unsigned: true })
  pickedUpBy: number | null;

  @Column("text", { name: "check_out_notes", nullable: true })
  checkOutNotes: string | null;

  @Column("text", { name: "check_in_notes", nullable: true })
  checkInNotes: string | null;

  @Column("int", { name: "created_by", unsigned: true })
  createdBy: number;

  @Column("int", { name: "updated_by", nullable: true, unsigned: true })
  updatedBy: number | null;

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

  @ManyToOne(() => ChildrenEntity, (children) => children.dailyAttendances, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;

  @ManyToOne(
    () => AuthorizedPickupPersonsEntity,
    (authorizedPickupPersons) => authorizedPickupPersons.dailyAttendances,
    { onDelete: "SET NULL", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "delivered_by", referencedColumnName: "id" }])
  deliveredBy2: AuthorizedPickupPersonsEntity;

  @ManyToOne(
    () => AuthorizedPickupPersonsEntity,
    (authorizedPickupPersons) => authorizedPickupPersons.dailyAttendances2,
    { onDelete: "SET NULL", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "picked_up_by", referencedColumnName: "id" }])
  pickedUpBy2: AuthorizedPickupPersonsEntity;

  @ManyToOne(() => UsersEntity, (users) => users.dailyAttendances, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: UsersEntity;

  @ManyToOne(() => UsersEntity, (users) => users.dailyAttendances2, {
    onDelete: "SET NULL",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: UsersEntity;

  @OneToMany(
    () => DailyObservationsEntity,
    (dailyObservations) => dailyObservations.attendance
  )
  dailyObservations: DailyObservationsEntity[];

  @OneToMany(
    () => ActivityPhotosEntity,
    (activityPhotos) => activityPhotos.attendance
  )
  activityPhotos: ActivityPhotosEntity[];

  @OneToMany(
    () => DailyActivitiesEntity,
    (dailyActivities) => dailyActivities.attendance
  )
  dailyActivities: DailyActivitiesEntity[];
}
