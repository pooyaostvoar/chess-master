import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsPrivateToUsers1784200000000 implements MigrationInterface {
  name = "AddIsPrivateToUsers1784200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isPrivate" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `UPDATE "users" SET "isPrivate" = true WHERE "status" = 'disabled'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isPrivate"`);
  }
}
