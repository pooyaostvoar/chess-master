import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToBlogPosts1778530000000 implements MigrationInterface {
  name = "AddImageUrlToBlogPosts1778530000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blogPost" ADD "imageUrl" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blogPost" DROP COLUMN "imageUrl"`);
  }
}
