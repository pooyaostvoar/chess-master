import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  email: string;

  @Column("text")
  username: string;

  @Column("boolean", { default: false })
  isMaster: boolean;

  @Column("text", { nullable: true })
  title: string | null;

  @Column("integer", { nullable: true })
  rating: number | null;

  @Column("text", { nullable: true })
  bio: string | null;

  @Column("bytea")
  password: Buffer;

  @Column("bytea")
  salt: Buffer;
}
