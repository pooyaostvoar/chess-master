import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessage1766577828253 implements MigrationInterface {
    name = 'AddMessage1766577828253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "fromUserId" integer NOT NULL, "toUserId" integer NOT NULL, "text" text NOT NULL, "isSeen" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_49d4ebebe47878d2960ecb0622" ON "message" ("fromUserId", "toUserId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_49d4ebebe47878d2960ecb0622"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
