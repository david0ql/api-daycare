import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UsersEntity } from "./users.entity";

@Index("idx_event_type", ["eventType"], {})
@Index("idx_dates", ["startDate", "endDate"], {})
@Index("idx_created_by", ["createdBy"], {})
@Entity("calendar_events", { schema: "daycare_db" })
export class CalendarEventsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("enum", {
    name: "event_type",
    enum: ["holiday", "vacation", "meeting", "event", "closure"],
  })
  eventType: "holiday" | "vacation" | "meeting" | "event" | "closure";

  @Column("date", { name: "start_date" })
  startDate: string;

  @Column("date", { name: "end_date" })
  endDate: string;

  @Column("tinyint", {
    name: "is_all_day",
    nullable: true,
    width: 1,
    default: () => "'1'",
  })
  isAllDay: boolean | null;

  @Column("time", { name: "start_time", nullable: true })
  startTime: string | null;

  @Column("time", { name: "end_time", nullable: true })
  endTime: string | null;

  @Column("int", { name: "created_by", unsigned: true })
  createdBy: number;

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

  @ManyToOne(() => UsersEntity, (users) => users.calendarEvents, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: UsersEntity;
}
