import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";

/** Names match `1776400000000-periodic-slot-config.ts` so `migration:generate` stays clean. */
@Entity("periodic_slot_configs")
@Index("IDX_periodic_slot_configs_userId", ["user"])
export class PeriodicSlotConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  chunkSizeMinutes: number;

  /** Matches `Period` in @chess-master/schemas: daily | weekly | monthly */
  @Column("text")
  period: string;

  @Column("int")
  repeatCount: number;

  @ManyToOne(() => User, (user) => user.periodicSlotConfigs, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "userId",
    foreignKeyConstraintName: "FK_periodic_slot_configs_user",
  })
  user: User;
}
