import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity()
@Index(["fromUserId", "toUserId"])
export class Message {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "int" })
  fromUserId: number;

  @Column({ type: "int" })
  toUserId: number;

  @Column({ type: "text" })
  text: string;

  @Column({ type: "boolean", default: false })
  isSeen: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
