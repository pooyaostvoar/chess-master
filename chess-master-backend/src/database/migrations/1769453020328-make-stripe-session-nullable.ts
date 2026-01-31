import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeStripeSessionNullable1769453020328 implements MigrationInterface {
    name = 'MakeStripeSessionNullable1769453020328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "stripeSessionId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "stripeSessionId" SET NOT NULL`);
    }

}
