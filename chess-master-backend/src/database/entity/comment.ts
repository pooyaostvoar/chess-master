import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

@Entity("comment")
@Index("IDX_comment_masterId", ["master"])
@Index("IDX_comment_userId", ["user"])
export class Comment {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "text" })
  text: string;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({
    name: "masterId",
    foreignKeyConstraintName: "FK_comment_master",
  })
  master: User;

  @RelationId((comment: Comment) => comment.master)
  masterId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({
    name: "userId",
    foreignKeyConstraintName: "FK_comment_user",
  })
  user: User;

  @RelationId((comment: Comment) => comment.user)
  userId: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
