import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765209203395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public`
    );

    // Create users table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                id SERIAL PRIMARY KEY,
                email text NOT NULL,
                username text NOT NULL UNIQUE,
                "isMaster" boolean DEFAULT false NOT NULL,
                title text,
                rating integer,
                bio text,
                "profilePicture" text,
                "chesscomUrl" text,
                "lichessUrl" text,
                password bytea NOT NULL,
                salt bytea NOT NULL,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username)
            )
        `);

    // Create games table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.games (
                id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
                "whitePlayer" text NOT NULL,
                "blackPlayer" text,
                moves jsonb DEFAULT '[]'::jsonb NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                finished boolean DEFAULT false NOT NULL
            )
        `);

    // Create master_pricing table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.master_pricing (
                id SERIAL PRIMARY KEY,
                "masterId" integer NOT NULL UNIQUE,
                price5min integer,
                price10min integer,
                price15min integer,
                price30min integer,
                price45min integer,
                price60min integer,
                CONSTRAINT "UQ_d1052a974c9d4242ca4a34c7fc7" UNIQUE ("masterId")
            )
        `);

    // Create schedule_slots table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.schedule_slots (
                id SERIAL PRIMARY KEY,
                "startTime" timestamp with time zone NOT NULL,
                "endTime" timestamp with time zone NOT NULL,
                status text DEFAULT 'free'::text NOT NULL,
                "masterId" integer,
                "reservedById" integer
            )
        `);

    // Add foreign key constraints if they don't exist
    await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_d1052a974c9d4242ca4a34c7fc7'
                ) THEN
                    ALTER TABLE public.master_pricing
                    ADD CONSTRAINT "FK_d1052a974c9d4242ca4a34c7fc7"
                    FOREIGN KEY ("masterId") REFERENCES public.users(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `);

    await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_f3e0964139bb9dc453794365e14'
                ) THEN
                    ALTER TABLE public.schedule_slots
                    ADD CONSTRAINT "FK_f3e0964139bb9dc453794365e14"
                    FOREIGN KEY ("masterId") REFERENCES public.users(id);
                END IF;
            END $$;
        `);

    await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_6d590c289652b6a1baf18619883'
                ) THEN
                    ALTER TABLE public.schedule_slots
                    ADD CONSTRAINT "FK_6d590c289652b6a1baf18619883"
                    FOREIGN KEY ("reservedById") REFERENCES public.users(id);
                END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.schedule_slots DROP CONSTRAINT IF EXISTS "FK_6d590c289652b6a1baf18619883"`
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.schedule_slots DROP CONSTRAINT IF EXISTS "FK_f3e0964139bb9dc453794365e14"`
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.master_pricing DROP CONSTRAINT IF EXISTS "FK_d1052a974c9d4242ca4a34c7fc7"`
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS public.schedule_slots`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.master_pricing`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.games`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.users`);

    // Drop extension (optional, comment out if you want to keep it)
    // await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
