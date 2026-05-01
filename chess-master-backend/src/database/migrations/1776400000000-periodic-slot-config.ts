import { MigrationInterface, QueryRunner } from "typeorm";

export class PeriodicSlotConfig1776400000000 implements MigrationInterface {
  name = "PeriodicSlotConfig1776400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "periodic_slot_configs" (
                "id" SERIAL NOT NULL,
                "chunkSizeMinutes" integer NOT NULL,
                "period" text NOT NULL,
                "repeatCount" integer NOT NULL,
                "userId" integer NOT NULL,
                CONSTRAINT "PK_periodic_slot_configs" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "periodic_slot_configs"
            ADD CONSTRAINT "FK_periodic_slot_configs_user"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_periodic_slot_configs_userId"
            ON "periodic_slot_configs" ("userId")
        `);

    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD "chunkIndex" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD "periodicSlotConfigId" integer`
    );
    await queryRunner.query(`
            ALTER TABLE "schedule_slots"
            ADD CONSTRAINT "FK_schedule_slots_periodic_slot_config"
            FOREIGN KEY ("periodicSlotConfigId") REFERENCES "periodic_slot_configs"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_schedule_slots_periodicSlotConfigId"
            ON "schedule_slots" ("periodicSlotConfigId")
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_schedule_slots_masterId"
            ON "schedule_slots" ("masterId")
        `);
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_schedule_slots_reservedById"
            ON "schedule_slots" ("reservedById")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_schedule_slots_reservedById"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_schedule_slots_masterId"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_schedule_slots_periodicSlotConfigId"`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP CONSTRAINT "FK_schedule_slots_periodic_slot_config"`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP COLUMN "periodicSlotConfigId"`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP COLUMN "chunkIndex"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_periodic_slot_configs_userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "periodic_slot_configs" DROP CONSTRAINT "FK_periodic_slot_configs_user"`
    );
    await queryRunner.query(`DROP TABLE "periodic_slot_configs"`);
  }
}
