import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleToken1768249589141 implements MigrationInterface {
    name = 'AddGoogleToken1768249589141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "googleAccessToken" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "googleRefreshToken" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleAccessToken"`);
    }

}
