import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeSaltNullable1766233376239 implements MigrationInterface {
    name = 'MakeSaltNullable1766233376239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "salt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "salt" SET NOT NULL`);
    }

}
