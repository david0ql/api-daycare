import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AuditLogEntity } from "./audit_log.entity";
import { DailyAttendanceEntity } from "./daily_attendance.entity";
import { IncidentsEntity } from "./incidents.entity";
import { ParentChildRelationshipsEntity } from "./parent_child_relationships.entity";
import { UserRolesEntity } from "./user_roles.entity";
import { MessageThreadsEntity } from "./message_threads.entity";
import { CalendarEventsEntity } from "./calendar_events.entity";
import { DailyObservationsEntity } from "./daily_observations.entity";
import { ActivityPhotosEntity } from "./activity_photos.entity";
import { DailyActivitiesEntity } from "./daily_activities.entity";
import { IncidentAttachmentsEntity } from "./incident_attachments.entity";
import { MessageRecipientsEntity } from "./message_recipients.entity";
import { MessagesEntity } from "./messages.entity";
import { SystemParametersEntity } from "./system_parameters.entity";
import { DocumentsEntity } from "./documents.entity";

@Index("email", ["email"], { unique: true })
@Index("idx_email", ["email"], {})
@Index("idx_role", ["roleId"], {})
@Index("idx_active", ["isActive"], {})
@Entity("users", { schema: "daycare_db" })
export class UsersEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("varchar", { name: "password_hash", length: 255 })
  passwordHash: string;

  @Column("varchar", { name: "first_name", length: 100 })
  firstName: string;

  @Column("varchar", { name: "last_name", length: 100 })
  lastName: string;

  @Column("varchar", { name: "phone", nullable: true, length: 20 })
  phone: string | null;

  @Column("varchar", { name: "profile_picture", nullable: true, length: 500 })
  profilePicture: string | null;

  @Column("int", { name: "role_id", unsigned: true })
  roleId: number;

  @Column("tinyint", {
    name: "is_active",
    nullable: true,
    width: 1,
    default: () => "'1'",
  })
  isActive: boolean | null;

  @Column("timestamp", { name: "last_login", nullable: true })
  lastLogin: Date | null;

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

  @OneToMany(() => AuditLogEntity, (auditLog) => auditLog.user)
  auditLogs: AuditLogEntity[];

  @OneToMany(
    () => DailyAttendanceEntity,
    (dailyAttendance) => dailyAttendance.createdBy2
  )
  dailyAttendances: DailyAttendanceEntity[];

  @OneToMany(
    () => DailyAttendanceEntity,
    (dailyAttendance) => dailyAttendance.updatedBy2
  )
  dailyAttendances2: DailyAttendanceEntity[];

  @OneToMany(() => IncidentsEntity, (incidents) => incidents.reportedBy2)
  incidents: IncidentsEntity[];

  @OneToMany(
    () => ParentChildRelationshipsEntity,
    (parentChildRelationships) => parentChildRelationships.parent
  )
  parentChildRelationships: ParentChildRelationshipsEntity[];

  @ManyToOne(() => UserRolesEntity, (userRoles) => userRoles.users, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: UserRolesEntity;

  @OneToMany(
    () => MessageThreadsEntity,
    (messageThreads) => messageThreads.createdBy2
  )
  messageThreads: MessageThreadsEntity[];

  @OneToMany(
    () => CalendarEventsEntity,
    (calendarEvents) => calendarEvents.createdBy2
  )
  calendarEvents: CalendarEventsEntity[];

  @OneToMany(
    () => DailyObservationsEntity,
    (dailyObservations) => dailyObservations.createdBy2
  )
  dailyObservations: DailyObservationsEntity[];

  @OneToMany(
    () => ActivityPhotosEntity,
    (activityPhotos) => activityPhotos.uploadedBy2
  )
  activityPhotos: ActivityPhotosEntity[];

  @OneToMany(
    () => DailyActivitiesEntity,
    (dailyActivities) => dailyActivities.createdBy2
  )
  dailyActivities: DailyActivitiesEntity[];

  @OneToMany(
    () => IncidentAttachmentsEntity,
    (incidentAttachments) => incidentAttachments.uploadedBy2
  )
  incidentAttachments: IncidentAttachmentsEntity[];

  @OneToMany(
    () => MessageRecipientsEntity,
    (messageRecipients) => messageRecipients.recipient
  )
  messageRecipients: MessageRecipientsEntity[];

  @OneToMany(() => MessagesEntity, (messages) => messages.sender)
  messages: MessagesEntity[];

  @OneToMany(
    () => SystemParametersEntity,
    (systemParameters) => systemParameters.updatedBy2
  )
  systemParameters: SystemParametersEntity[];

  @OneToMany(() => DocumentsEntity, (documents) => documents.uploadedBy2)
  documents: DocumentsEntity[];
}
