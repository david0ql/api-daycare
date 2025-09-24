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
import { UsersEntity } from "./users.entity";
import { MessagesEntity } from "./messages.entity";

@Index("idx_child", ["childId"], {})
@Index("idx_type", ["threadType"], {})
@Index("idx_created_by", ["createdBy"], {})
@Entity("message_threads", { schema: "daycare_db" })
export class MessageThreadsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("varchar", { name: "subject", length: 255 })
  subject: string;

  @Column("enum", {
    name: "thread_type",
    enum: ["general", "incident", "reminder", "activity"],
  })
  threadType: "general" | "incident" | "reminder" | "activity";

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

  @ManyToOne(() => ChildrenEntity, (children) => children.messageThreads, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;

  @ManyToOne(() => UsersEntity, (users) => users.messageThreads, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: UsersEntity;

  @OneToMany(() => MessagesEntity, (messages) => messages.thread)
  messages: MessagesEntity[];
}
