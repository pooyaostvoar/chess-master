import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./user";
import { SlotStatus } from "./types";

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
  title: SlotStatus | null;

  @Column("text", { nullable: true })
  youtubeId: SlotStatus | null;

  @ManyToOne(() => User, { nullable: true })
  reservedBy: User | null;
}
