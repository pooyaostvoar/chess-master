import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ScheduleSlot } from "./schedule-slots";
import { MasterPricing } from "./master-pricing";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  email: string;

  @Column({ type: "text", unique: true })
  username: string;

  @Column("boolean", { default: false })
  isMaster: boolean;

  @Column("text", { nullable: true })
  title: string | null;

  @Column("integer", { nullable: true })
  rating: number | null;

  @Column("text", { nullable: true })
  bio: string | null;

  @Column("text", { nullable: true })
  profilePicture: string | null;

  @Column("text", { nullable: true })
  chesscomUrl: string | null;

  @Column("text", { nullable: true })
  lichessUrl: string | null;

  @OneToOne(() => MasterPricing, (pricing) => pricing.master, {
    cascade: true,
  })
  pricing: MasterPricing | null;

  @Column("bytea")
  password: Buffer;

  @Column("bytea")
  salt: Buffer;

  @OneToMany(() => ScheduleSlot, (slot) => slot.master)
  schedule: ScheduleSlot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
