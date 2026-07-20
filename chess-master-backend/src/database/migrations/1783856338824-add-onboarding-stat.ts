import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingStat1783856338824 implements MigrationInterface {
    name = 'AddOnboardingStat1783856338824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "onboardingStatus" text NOT NULL DEFAULT 'basic-info'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onboardingStatus"`);
    }

}
