import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./user";
import { SlotStatus } from "./types";
import { Payment } from "./payment";

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

  @Column("int")
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

  @OneToMany(() => Payment, (payment) => payment.slot)
  payments: Payment[];
}
