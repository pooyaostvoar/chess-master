import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ScheduleSlot } from "./schedule-slots";
import { Payment } from "./payment";

export interface LichessPerfData {
  rating?: number;
  games?: number;
  rd?: number;
  prog?: number;
  prov?: boolean;
  rank?: number;
}

export type LichessRatingsMap = Record<string, LichessPerfData>;

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  email: string;

  @Column({ type: "text", unique: true })
  username: string;

  @Column({ type: "text", nullable: true })
  phoneNumber: string | null;

  @Column("boolean", { default: false })
  isMaster: boolean;

  @Column("text", { nullable: true })
  title: string | null;

  @Column("integer", { nullable: true })
  rating: number | null;

  @Column("text", { nullable: true })
  bio: string | null;

  @Column("text", { nullable: true })
  profilePictureThumbnailUrl: string | null;

  @Column("text", { nullable: true })
  profilePictureUrl: string | null;

  @Column("text", { nullable: true })
  chesscomUrl: string | null;

  @Column("text", { nullable: true })
  lichessUrl: string | null;

  @Column("text", { nullable: true })
  twitchUrl: string | null;

  @Column("text", { nullable: true })
  youtubeUrl: string | null;

  @Column("text", { nullable: true })
  instagramUrl: string | null;

  @Column("text", { nullable: true })
  xUrl: string | null;

  @Column("text", { nullable: true })
  facebookUrl: string | null;

  @Column("text", { nullable: true })
  tiktokUrl: string | null;

  @Column({
    type: "decimal",
    precision: 4,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  avgReviewRating: string | null;

  @Column("integer", { nullable: true })
  studentsCount: string | null;

  @Column("bytea", { nullable: true })
  password: Buffer;

  @Column("bytea", { nullable: true })
  salt: Buffer;

  @OneToMany(() => ScheduleSlot, (slot) => slot.master)
  schedule: ScheduleSlot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column("text", { nullable: true })
  googleId: string | null;

  @Column("text", { nullable: true })
  googleAccessToken: string | null;

  @Column("text", { nullable: true })
  googleRefreshToken: string | null;

  @Column("text", { nullable: true, unique: true })
  lichessId: string | null;

  @Column("text", { nullable: true })
  lichessUsername: string | null;

  @Column("jsonb", { nullable: true })
  lichessRatings: LichessRatingsMap | null;

  @Column("text", { array: true, nullable: true })
  languages?: string[] | null;

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
  hourlyRate: number | null;

  @OneToMany(() => Payment, (payment) => payment.slot)
  payments: Payment[];
}
