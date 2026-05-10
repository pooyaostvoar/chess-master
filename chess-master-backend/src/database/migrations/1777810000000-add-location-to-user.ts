import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationToUser1777810000000 implements MigrationInterface {
  name = "AddLocationToUser1777810000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "location" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "location"`);
  }
}
