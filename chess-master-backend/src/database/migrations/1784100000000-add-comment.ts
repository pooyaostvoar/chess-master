import { MigrationInterface, QueryRunner } from "typeorm";

export class AddComment1784100000000 implements MigrationInterface {
  name = "AddComment1784100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comment" (
        "id" SERIAL NOT NULL,
        "text" text NOT NULL,
        "masterId" integer NOT NULL,
        "userId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comment_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_masterId" ON "comment" ("masterId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_userId" ON "comment" ("userId")`
    );
    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD CONSTRAINT "FK_comment_master"
      FOREIGN KEY ("masterId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD CONSTRAINT "FK_comment_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_master"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_comment_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_comment_masterId"`);
    await queryRunner.query(`DROP TABLE "comment"`);
  }
}
