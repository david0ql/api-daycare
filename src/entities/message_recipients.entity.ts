import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MessagesEntity } from "./messages.entity";
import { UsersEntity } from "./users.entity";

@Index("unique_message_recipient", ["messageId", "recipientId"], {
  unique: true,
})
@Index("idx_message", ["messageId"], {})
@Index("idx_recipient", ["recipientId"], {})
@Entity("message_recipients", { schema: "daycare_db" })
export class MessageRecipientsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "message_id", unsigned: true })
  messageId: number;

  @Column("int", { name: "recipient_id", unsigned: true })
  recipientId: number;

  @Column("tinyint", {
    name: "is_read",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isRead: boolean | null;

  @Column("timestamp", { name: "read_at", nullable: true })
  readAt: Date | null;

  @ManyToOne(() => MessagesEntity, (messages) => messages.messageRecipients, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "message_id", referencedColumnName: "id" }])
  message: MessagesEntity;

  @ManyToOne(() => UsersEntity, (users) => users.messageRecipients, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "recipient_id", referencedColumnName: "id" }])
  recipient: UsersEntity;
}
