import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "games" }) // table name
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("int", { nullable: true })
  whitePlayerId: number | null;

  @Column("int", { nullable: true })
  blackPlayerId: number | null;

  @Column("jsonb", { default: [] })
  moves: { from: string; to: string; piece: string }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column("boolean", { default: false })
  finished: boolean;
}
