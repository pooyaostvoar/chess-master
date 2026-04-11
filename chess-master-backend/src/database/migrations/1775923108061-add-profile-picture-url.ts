import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePictureUrl1775923108061 implements MigrationInterface {
  name = "AddProfilePictureUrl1775923108061";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profilePictureThumbnailUrl" text`
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "profilePictureUrl" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profilePictureUrl"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profilePictureThumbnailUrl"`
    );
  }
}
