import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { ScheduleSlot } from "./schedule-slots";
import { User } from "./user";

export enum PaymentStatus {
  Pending = "pending",
  Succeeded = "succeeded",
  Failed = "failed",
  Refunded = "refunded",
}

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @ManyToOne(() => ScheduleSlot, (slot) => slot.payments, {
    onDelete: "CASCADE",
  })
  slot: ScheduleSlot;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @Index({ unique: true })
  @Column("text", { nullable: true })
  stripeSessionId: string | null;

  @Column("text", { nullable: true })
  stripePaymentIntentId: string | null;

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
  amountCents: number;

  @Column("text", { default: "usd" })
  currency: string;

  @Column({
    type: "text",
    default: PaymentStatus.Pending,
  })
  status: PaymentStatus;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
