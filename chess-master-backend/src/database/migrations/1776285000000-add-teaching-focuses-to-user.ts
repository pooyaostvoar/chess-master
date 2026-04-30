import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeachingFocusesToUser1776285000000
  implements MigrationInterface
{
  name = "AddTeachingFocusesToUser1776285000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "teachingFocuses" text array`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "teachingFocuses"`);
  }
}
