import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePricingTable1766426255266 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS "master_pricing";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.master_pricing (
                id SERIAL PRIMARY KEY,
                "masterId" integer NOT NULL UNIQUE,
                price5min integer,
                price10min integer,
                price15min integer,
                price30min integer,
                price45min integer,
                price60min integer,
                CONSTRAINT "UQ_d1052a974c9d4242ca4a34c7fc7" UNIQUE ("masterId")
            )
        `);
  }
}
