import { MigrationInterface, QueryRunner } from "typeorm";

export class PriceCent1769366212861 implements MigrationInterface {
    name = 'PriceCent1769366212861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_slots" ADD "priceCents" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_slots" DROP COLUMN "priceCents"`);
    }

}
