import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneNumber1766856179617 implements MigrationInterface {
    name = 'AddPhoneNumber1766856179617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
    }

}
