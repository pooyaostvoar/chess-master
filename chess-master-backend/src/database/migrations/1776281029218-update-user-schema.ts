import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserSchema1776281029218 implements MigrationInterface {
    name = 'UpdateUserSchema1776281029218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "twitchUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "youtubeUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "instagramUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "xUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "facebookUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "tiktokUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avgReviewRating" numeric(4,2)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "studentsCount" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "studentsCount"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avgReviewRating"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tiktokUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "facebookUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "xUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instagramUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "youtubeUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitchUrl"`);
    }

}
