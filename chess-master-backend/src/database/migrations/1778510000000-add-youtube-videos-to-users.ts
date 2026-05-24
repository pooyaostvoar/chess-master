import { MigrationInterface, QueryRunner } from "typeorm";

export class AddYoutubeVideosToUsers1778510000000 implements MigrationInterface {
  name = "AddYoutubeVideosToUsers1778510000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "youtubeVideos" text array`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "youtubeVideos"`);
  }
}
