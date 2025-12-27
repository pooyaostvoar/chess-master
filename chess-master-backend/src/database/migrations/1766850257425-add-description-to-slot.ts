import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToSlot1766850257425 implements MigrationInterface {
    name = 'AddDescriptionToSlot1766850257425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_slots" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_slots" DROP COLUMN "description"`);
    }

}
