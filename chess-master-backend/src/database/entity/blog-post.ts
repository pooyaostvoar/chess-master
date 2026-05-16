import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("blogPost")
@Index("IDX_blogPost_slug", ["slug"], { unique: true })
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 500 })
  title: string;

  @Column({ type: "varchar", length: 500 })
  slug: string;

  @Column({ type: "text" })
  contentHtml: string;
}
