import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePrincing1766416138332 implements MigrationInterface {
  name = "UpdatePrincing1766416138332";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD "price" numeric(10,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "hourlyRate" numeric(10,2)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hourlyRate"`);
    await queryRunner.query(`ALTER TABLE "schedule_slots" DROP COLUMN "price"`);
  }
}
