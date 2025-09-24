import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DailyAttendanceEntity } from "./daily_attendance.entity";
import { IncidentsEntity } from "./incidents.entity";
import { ParentChildRelationshipsEntity } from "./parent_child_relationships.entity";
import { MessageThreadsEntity } from "./message_threads.entity";
import { DailyObservationsEntity } from "./daily_observations.entity";
import { ActivityPhotosEntity } from "./activity_photos.entity";
import { AuthorizedPickupPersonsEntity } from "./authorized_pickup_persons.entity";
import { DailyActivitiesEntity } from "./daily_activities.entity";
import { MedicalInformationEntity } from "./medical_information.entity";
import { EmergencyContactsEntity } from "./emergency_contacts.entity";
import { DocumentsEntity } from "./documents.entity";

@Index("idx_name", ["firstName", "lastName"], {})
@Index("idx_birth_date", ["birthDate"], {})
@Index("idx_payment_alert", ["hasPaymentAlert"], {})
@Index("idx_active", ["isActive"], {})
@Entity("children", { schema: "daycare_db" })
export class ChildrenEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "first_name", length: 100 })
  firstName: string;

  @Column("varchar", { name: "last_name", length: 100 })
  lastName: string;

  @Column("date", { name: "birth_date" })
  birthDate: string;

  @Column("varchar", { name: "birth_city", nullable: true, length: 100 })
  birthCity: string | null;

  @Column("varchar", { name: "profile_picture", nullable: true, length: 500 })
  profilePicture: string | null;

  @Column("text", { name: "address", nullable: true })
  address: string | null;

  @Column("tinyint", {
    name: "has_payment_alert",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  hasPaymentAlert: boolean | null;

  @Column("tinyint", {
    name: "is_active",
    nullable: true,
    width: 1,
    default: () => "'1'",
  })
  isActive: boolean | null;

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

  @OneToMany(() => DailyAttendanceEntity, (dailyAttendance) => dailyAttendance.child)
  dailyAttendances: DailyAttendanceEntity[];

  @OneToMany(() => IncidentsEntity, (incidents) => incidents.child)
  incidents: IncidentsEntity[];

  @OneToMany(
    () => ParentChildRelationshipsEntity,
    (parentChildRelationships) => parentChildRelationships.child
  )
  parentChildRelationships: ParentChildRelationshipsEntity[];

  @OneToMany(() => MessageThreadsEntity, (messageThreads) => messageThreads.child)
  messageThreads: MessageThreadsEntity[];

  @OneToMany(
    () => DailyObservationsEntity,
    (dailyObservations) => dailyObservations.child
  )
  dailyObservations: DailyObservationsEntity[];

  @OneToMany(() => ActivityPhotosEntity, (activityPhotos) => activityPhotos.child)
  activityPhotos: ActivityPhotosEntity[];

  @OneToMany(
    () => AuthorizedPickupPersonsEntity,
    (authorizedPickupPersons) => authorizedPickupPersons.child
  )
  authorizedPickupPersons: AuthorizedPickupPersonsEntity[];

  @OneToMany(() => DailyActivitiesEntity, (dailyActivities) => dailyActivities.child)
  dailyActivities: DailyActivitiesEntity[];

  @OneToOne(
    () => MedicalInformationEntity,
    (medicalInformation) => medicalInformation.child
  )
  medicalInformation: MedicalInformationEntity;

  @OneToMany(
    () => EmergencyContactsEntity,
    (emergencyContacts) => emergencyContacts.child
  )
  emergencyContacts: EmergencyContactsEntity[];

  @OneToMany(() => DocumentsEntity, (documents) => documents.child)
  documents: DocumentsEntity[];
}
