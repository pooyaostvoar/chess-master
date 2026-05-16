import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameBlogPostsTable1778500000001 implements MigrationInterface {
  name = "RenameBlogPostsTable1778500000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasOldTable = await queryRunner.hasTable("blog_posts");
    const hasNewTable = await queryRunner.hasTable("blogPost");

    if (hasOldTable && !hasNewTable) {
      await queryRunner.query(`ALTER TABLE "blog_posts" RENAME TO "blogPost"`);
      await queryRunner.query(
        `ALTER INDEX IF EXISTS "IDX_blog_posts_slug" RENAME TO "IDX_blogPost_slug"`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasNewTable = await queryRunner.hasTable("blogPost");
    const hasOldTable = await queryRunner.hasTable("blog_posts");

    if (hasNewTable && !hasOldTable) {
      await queryRunner.query(`ALTER TABLE "blogPost" RENAME TO "blog_posts"`);
      await queryRunner.query(
        `ALTER INDEX IF EXISTS "IDX_blogPost_slug" RENAME TO "IDX_blog_posts_slug"`
      );
    }
  }
}
