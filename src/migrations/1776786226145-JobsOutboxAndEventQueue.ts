import { MigrationInterface, QueryRunner } from "typeorm";

export class JobsOutboxAndEventQueue1776786226145 implements MigrationInterface {
    name = 'JobsOutboxAndEventQueue1776786226145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event_queue" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT '0', "lastError" text, "type" character varying(100) NOT NULL, "emitter" character varying(100) NOT NULL, "updated_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "payload" jsonb NOT NULL, "processed_at" TIMESTAMP, CONSTRAINT "PK_f2ab43ee6a569a89ba286db2fa6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "jobs_outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT '0', "lastError" text, "type" character varying(100) NOT NULL, "emitter" character varying(100) NOT NULL, "updated_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "target" character varying(100) NOT NULL, "payload" jsonb NOT NULL, "scheduled_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_7172b6dd5767f423ecb44d9fb57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."events_type_enum" RENAME TO "events_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."events_type_enum" AS ENUM('0', '1', '2', '-1')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" TYPE "public"."events_type_enum" USING "type"::"text"::"public"."events_type_enum"`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "public"."events_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."events_state_enum" RENAME TO "events_state_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."events_state_enum" AS ENUM('0', '1', '2', '3', '-1')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "state" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "state" TYPE "public"."events_state_enum" USING "state"::"text"::"public"."events_state_enum"`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "state" SET DEFAULT '1'`);
        await queryRunner.query(`DROP TYPE "public"."events_state_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."events_state_enum_old" AS ENUM('EVENT_STATE_UNSPECIFIED', 'EVENT_STATE_DRAFT', 'EVENT_STATE_PUBLISHED', 'EVENT_STATE_CANCELLED', 'UNRECOGNIZED')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "state" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "state" TYPE "public"."events_state_enum_old" USING "state"::"text"::"public"."events_state_enum_old"`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "state" SET DEFAULT 'EVENT_STATE_DRAFT'`);
        await queryRunner.query(`DROP TYPE "public"."events_state_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."events_state_enum_old" RENAME TO "events_state_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."events_type_enum_old" AS ENUM('EVENT_TYPE_UNSPECIFIED', 'EVENT_TYPE_SOCIAL', 'EVENT_TYPE_ECOLOGY', 'UNRECOGNIZED')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" TYPE "public"."events_type_enum_old" USING "type"::"text"::"public"."events_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" SET DEFAULT 'EVENT_TYPE_UNSPECIFIED'`);
        await queryRunner.query(`DROP TYPE "public"."events_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."events_type_enum_old" RENAME TO "events_type_enum"`);
        await queryRunner.query(`DROP TABLE "jobs_outbox"`);
        await queryRunner.query(`DROP TABLE "event_queue"`);
    }

}
