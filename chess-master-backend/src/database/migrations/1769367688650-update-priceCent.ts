import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePriceCent1769367688650 implements MigrationInterface {
    name = 'UpdatePriceCent1769367688650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_slots" DROP COLUMN "priceCents"`);
        await queryRunner.query(`ALTER TABLE "schedule_slots" ADD "priceCents" numeric(12,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_slots" DROP COLUMN "priceCents"`);
        await queryRunner.query(`ALTER TABLE "schedule_slots" ADD "priceCents" integer`);
    }

}
