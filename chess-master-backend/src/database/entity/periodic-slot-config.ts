import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";

@Entity("periodic_slot_configs")
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
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;
}
