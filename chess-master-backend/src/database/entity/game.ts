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

  @Column("text")
  whitePlayer: string;

  @Column("text", { nullable: true })
  blackPlayer: string | null;

  @Column("jsonb", { default: [] })
  moves: { from: string; to: string; piece: string }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column("boolean", { default: false })
  finished: boolean;
}
