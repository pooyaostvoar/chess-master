import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserStatusAndIndexes1778425959070 implements MigrationInterface {
    name = 'AddUserStatusAndIndexes1778425959070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "status" text NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`CREATE INDEX "IDX_users_status_isMaster" ON "users" ("status", "isMaster") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_users_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_status_isMaster"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    }

}
