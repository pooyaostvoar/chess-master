import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePriceCentGeneratedColumn1777807108397 implements MigrationInterface {
    name = 'MakePriceCentGeneratedColumn1777807108397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_slots" DROP COLUMN "priceCents"`);
        await queryRunner.query(`ALTER TABLE "schedule_slots" ADD "priceCents" numeric(12,2) GENERATED ALWAYS AS (price::numeric * 100) STORED`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["chess_master","public","schedule_slots","GENERATED_COLUMN","priceCents","price::numeric * 100"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","priceCents","chess_master","public","schedule_slots"]);
        await queryRunner.query(`ALTER TABLE "schedule_slots" DROP COLUMN "priceCents"`);
        await queryRunner.query(`ALTER TABLE "schedule_slots" ADD "priceCents" numeric(12,2)`);
    }

}
