import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTitleAndYoutubeToScheduleSlots1765628788245
  implements MigrationInterface
{
  name = "AddTitleAndYoutubeToScheduleSlots1765628788245";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD COLUMN IF NOT EXISTS "title" text`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD COLUMN IF NOT EXISTS "youtubeId" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP COLUMN IF EXISTS "youtubeId"`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP COLUMN IF EXISTS "title"`
    );
  }
}
