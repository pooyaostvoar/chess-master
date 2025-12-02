import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("admin_users")
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  username: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", default: "active" })
  status: string;

  @Column("bytea")
  password: Buffer;

  @Column("bytea")
  salt: Buffer;
}
