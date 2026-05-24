import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryToUsers1778500000000 implements MigrationInterface {
  name = "AddCountryToUsers1778500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "country" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
  }
}
