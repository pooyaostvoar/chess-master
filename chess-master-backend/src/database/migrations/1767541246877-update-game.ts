import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGame1767541246877 implements MigrationInterface {
    name = 'UpdateGame1767541246877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "whitePlayer"`);
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "blackPlayer"`);
        await queryRunner.query(`ALTER TABLE "games" ADD "whitePlayerId" integer`);
        await queryRunner.query(`ALTER TABLE "games" ADD "blackPlayerId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "blackPlayerId"`);
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "whitePlayerId"`);
        await queryRunner.query(`ALTER TABLE "games" ADD "blackPlayer" text`);
        await queryRunner.query(`ALTER TABLE "games" ADD "whitePlayer" text NOT NULL`);
    }

}
