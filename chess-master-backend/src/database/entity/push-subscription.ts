import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity()
export class PushSubscription {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "int" })
  @Index()
  userId: number;

  @Column({ type: "varchar", length: 500 })
  @Index({ unique: true })
  endpoint: string;

  @Column({ type: "varchar", length: 500 })
  p256dh: string;

  @Column({ type: "varchar", length: 500 })
  auth: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
