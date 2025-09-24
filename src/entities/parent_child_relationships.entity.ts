import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UsersEntity } from "./users.entity";
import { ChildrenEntity } from "./children.entity";

@Index("unique_parent_child", ["parentId", "childId"], { unique: true })
@Index("idx_parent", ["parentId"], {})
@Index("idx_child", ["childId"], {})
@Index("idx_primary", ["isPrimary"], {})
@Entity("parent_child_relationships", { schema: "daycare_db" })
export class ParentChildRelationshipsEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "parent_id", unsigned: true })
  parentId: number;

  @Column("int", { name: "child_id", unsigned: true })
  childId: number;

  @Column("enum", {
    name: "relationship_type",
    enum: ["father", "mother", "guardian", "other"],
  })
  relationshipType: "father" | "mother" | "guardian" | "other";

  @Column("tinyint", {
    name: "is_primary",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isPrimary: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => UsersEntity, (users) => users.parentChildRelationships, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: UsersEntity;

  @ManyToOne(() => ChildrenEntity, (children) => children.parentChildRelationships, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "child_id", referencedColumnName: "id" }])
  child: ChildrenEntity;
}
