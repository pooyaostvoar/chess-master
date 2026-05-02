import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncPriceCentsFromPriceTrigger1778200000000
  implements MigrationInterface
{
  name = "SyncPriceCentsFromPriceTrigger1778200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION schedule_slots_sync_price_cents_from_price()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW."price" IS NULL THEN
                    NEW."priceCents" := NULL;
                ELSE
                    NEW."priceCents" := CAST(NEW."price" AS DECIMAL) * 100;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
            DROP TRIGGER IF EXISTS schedule_slots_sync_price_cents ON "schedule_slots";
        `);

    await queryRunner.query(`
            CREATE TRIGGER schedule_slots_sync_price_cents
            BEFORE INSERT OR UPDATE OF "price" ON "schedule_slots"
            FOR EACH ROW
            EXECUTE PROCEDURE schedule_slots_sync_price_cents_from_price();
        `);

    await queryRunner.query(`
            UPDATE "schedule_slots"
            SET "priceCents" = CAST("price" AS DECIMAL) * 100
            WHERE "price" IS NOT NULL;
        `);

    await queryRunner.query(`
            UPDATE "schedule_slots"
            SET "priceCents" = NULL
            WHERE "price" IS NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS schedule_slots_sync_price_cents ON "schedule_slots";
        `);
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS schedule_slots_sync_price_cents_from_price();
        `);
  }
}
