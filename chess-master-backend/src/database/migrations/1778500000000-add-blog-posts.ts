import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogPosts1778500000000 implements MigrationInterface {
  name = "AddBlogPosts1778500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blogPost" (
        "id" SERIAL NOT NULL,
        "title" character varying(500) NOT NULL,
        "slug" character varying(500) NOT NULL,
        "contentHtml" text NOT NULL,
        CONSTRAINT "PK_blogPost_id" PRIMARY KEY ("id")
      )`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_blogPost_slug" ON "blogPost" ("slug")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_blogPost_slug"`);
    await queryRunner.query(`DROP TABLE "blogPost"`);
  }
}
