import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameLastnameToUser1776291000000 implements MigrationInterface {
  name = "AddNameLastnameToUser1776291000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "name" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "lastname" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastname"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
  }
}
