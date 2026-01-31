import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayment1769449415272 implements MigrationInterface {
    name = 'AddPayment1769449415272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" SERIAL NOT NULL, "stripeSessionId" text NOT NULL, "stripePaymentIntentId" text, "amountCents" numeric(12,2), "currency" text NOT NULL DEFAULT 'usd', "status" text NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "slotId" integer, "userId" integer, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a28176322ae1df51730ffa1d8b" ON "payments" ("stripeSessionId") `);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d985ed6885840aab8b4370bf65a" FOREIGN KEY ("slotId") REFERENCES "schedule_slots"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d985ed6885840aab8b4370bf65a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a28176322ae1df51730ffa1d8b"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
