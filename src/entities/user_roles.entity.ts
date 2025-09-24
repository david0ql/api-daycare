import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UsersEntity } from "./users.entity";

@Index("name", ["name"], { unique: true })
@Entity("user_roles", { schema: "daycare_db" })
export class UserRolesEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 50 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(() => UsersEntity, (users) => users.role)
  users: UsersEntity[];
}
