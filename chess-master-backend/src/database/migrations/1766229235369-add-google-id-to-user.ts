import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleIdToUser1766229235369 implements MigrationInterface {
    name = 'AddGoogleIdToUser1766229235369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "googleId" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
    }

}
