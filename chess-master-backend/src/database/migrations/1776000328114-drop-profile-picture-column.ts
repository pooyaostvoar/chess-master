import { MigrationInterface, QueryRunner } from "typeorm";

export class DropProfilePictureColumn1776000328114 implements MigrationInterface {
    name = 'DropProfilePictureColumn1776000328114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profilePicture"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "profilePicture" text`);
    }

}
