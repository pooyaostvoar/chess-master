import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPeriodicSlotConfig1777730137894 implements MigrationInterface {
  name = "AddPeriodicSlotConfig1777730137894";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "periodic_slot_configs" ("id" SERIAL NOT NULL, "chunkSizeMinutes" integer NOT NULL, "period" text NOT NULL, "repeatCount" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_6bc348f09db05aab7fd86c045c3" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_periodic_slot_configs_userId" ON "periodic_slot_configs" ("userId") `
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD "chunkIndex" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD "periodicSlotConfigId" integer`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_schedule_slots_periodicSlotConfigId" ON "schedule_slots" ("periodicSlotConfigId") `
    );
    await queryRunner.query(
      `ALTER TABLE "periodic_slot_configs" ADD CONSTRAINT "FK_periodic_slot_configs_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" ADD CONSTRAINT "FK_schedule_slots_periodic_slot_config" FOREIGN KEY ("periodicSlotConfigId") REFERENCES "periodic_slot_configs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP CONSTRAINT "FK_schedule_slots_periodic_slot_config"`
    );
    await queryRunner.query(
      `ALTER TABLE "periodic_slot_configs" DROP CONSTRAINT "FK_periodic_slot_configs_user"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_schedule_slots_periodicSlotConfigId"`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP COLUMN "periodicSlotConfigId"`
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_slots" DROP COLUMN "chunkIndex"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_periodic_slot_configs_userId"`
    );
    await queryRunner.query(`DROP TABLE "periodic_slot_configs"`);
  }
}
