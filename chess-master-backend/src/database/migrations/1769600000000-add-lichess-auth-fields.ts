import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLichessAuthFields1769600000000 implements MigrationInterface {
  name = "AddLichessAuthFields1769600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "lichessId" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "lichessUsername" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "lichessRatings" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_lichess_id" UNIQUE ("lichessId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_lichess_id"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lichessRatings"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lichessUsername"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lichessId"`);
  }
}
