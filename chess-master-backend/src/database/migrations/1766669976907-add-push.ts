import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPush1766669976907 implements MigrationInterface {
    name = 'AddPush1766669976907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "push_subscription" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "endpoint" character varying(500) NOT NULL, "p256dh" character varying(500) NOT NULL, "auth" character varying(500) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07fc861c0d2c38c1b830fb9cb5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8a227cbc3dc43c0d56117ea156" ON "push_subscription" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_27ae9074fc39a09bc1aee263df" ON "push_subscription" ("endpoint") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_27ae9074fc39a09bc1aee263df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a227cbc3dc43c0d56117ea156"`);
        await queryRunner.query(`DROP TABLE "push_subscription"`);
    }

}
