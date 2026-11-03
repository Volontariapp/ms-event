import type { MigrationInterface, QueryRunner } from 'typeorm';

// Index de recherche sur "events", chacun lie a un WHERE/ORDER BY de searchAdvanced
// (domain-event, postgres-event.repository.ts). Utilite inferee de la lecture des requetes,
// EXPLAIN non execute: a valider sur une base de dev.
//
// CREATE INDEX simple et non CONCURRENTLY: `transaction = false` fait lever
// ForbiddenTransactionModeOverrideError a TypeORM sous le mode par defaut ("all") utilise par
// les scripts migration:run:*. Le verrou d'ecriture dure le temps de construire l'index.
export class AddEventSearchIndexes1792300000000 implements MigrationInterface {
  name = 'AddEventSearchIndexes1792300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Filtre organizerId = :organizerId
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_events_organizer_id" ON "events" ("organizerId")`,
    );
    // Filtres state IN (...) + startAt >= / <= (fenetre de dates)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_events_state_start_at" ON "events" ("state", "startAt")`,
    );
    // Tri par defaut ORDER BY createdAt DESC (hors recherche geographique)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_events_created_at_desc" ON "events" ("createdAt" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_events_created_at_desc"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_events_state_start_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_events_organizer_id"`);
  }
}
