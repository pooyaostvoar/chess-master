import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMicrosoftAuthFields1784000000000 implements MigrationInterface {
  name = "AddMicrosoftAuthFields1784000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "microsoftId" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_microsoft_id" UNIQUE ("microsoftId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_microsoft_id"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "microsoftId"`);
  }
}
