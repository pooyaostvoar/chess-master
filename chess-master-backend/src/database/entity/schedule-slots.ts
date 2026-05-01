import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user";
import { SlotStatus } from "./types";
import { Payment } from "./payment";
import { PeriodicSlotConfig } from "./periodic-slot-config";

@Entity("schedule_slots")
export class ScheduleSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.schedule)
  master: User;

  @Column("timestamptz")
  startTime: Date;

  @Column("timestamptz")
  endTime: Date;

  @Column("text", { default: SlotStatus.Free })
  status: SlotStatus;

  @Column("text", { nullable: true })
  title: string | null;

  @Column("text", { nullable: true })
  description: string | null;

  @Column("text", { nullable: true })
  youtubeId: string | null;

  @ManyToOne(() => User, { nullable: true })
  reservedBy: User | null;

  @Column("int", { nullable: true })
  reservedById: number | null;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  price: number | null;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  priceCents: number | null;

  /** Index of this chunk within one occurrence of the interval (0-based; resets each repeat). */
  @Column("int", { nullable: true })
  chunkIndex: number | null;

  @ManyToOne(() => PeriodicSlotConfig, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "periodicSlotConfigId" })
  periodicSlotConfig: PeriodicSlotConfig | null;

  @OneToMany(() => Payment, (payment) => payment.slot)
  payments: Payment[];
}
