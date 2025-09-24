import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MessageRecipientsEntity } from "./message_recipients.entity";
import { MessageThreadsEntity } from "./message_threads.entity";
import { UsersEntity } from "./users.entity";

@Index("idx_thread", ["threadId"], {})
@Index("idx_sender", ["senderId"], {})
@Index("idx_created_at", ["createdAt"], {})
@Entity("messages", { schema: "daycare_db" })
export class MessagesEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "thread_id", unsigned: true })
  threadId: number;

  @Column("int", { name: "sender_id", unsigned: true })
  senderId: number;

  @Column("text", { name: "message_text" })
  messageText: string;

  @Column("varchar", {
    name: "attachment_filename",
    nullable: true,
    length: 255,
  })
  attachmentFilename: string | null;

  @Column("varchar", { name: "attachment_path", nullable: true, length: 500 })
  attachmentPath: string | null;

  @Column("tinyint", {
    name: "is_read",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isRead: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(
    () => MessageRecipientsEntity,
    (messageRecipients) => messageRecipients.message
  )
  messageRecipients: MessageRecipientsEntity[];

  @ManyToOne(
    () => MessageThreadsEntity,
    (messageThreads) => messageThreads.messages,
    { onDelete: "CASCADE", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "thread_id", referencedColumnName: "id" }])
  thread: MessageThreadsEntity;

  @ManyToOne(() => UsersEntity, (users) => users.messages, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "sender_id", referencedColumnName: "id" }])
  sender: UsersEntity;
}
