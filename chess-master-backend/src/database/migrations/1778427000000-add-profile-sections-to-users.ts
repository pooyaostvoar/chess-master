import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileSectionsToUsers1778427000000 implements MigrationInterface {
  name = "AddProfileSectionsToUsers1778427000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "profileSections" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileSections"`);
  }
}
