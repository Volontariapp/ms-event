import { MAX_EVENT_IDS_PER_LOOKUP } from '@volontariapp/domain-event';
import type { EventEntity } from '@volontariapp/domain-event';
import type { PaginationResponse } from '@volontariapp/contracts-nest';

/** Sous-ensemble d'EventService necessaire a la resolution par lot (facilite les tests). */
export interface EventsBatchLookup {
  findByIds(ids: string[]): Promise<EventEntity[]>;
}

/**
 * Charge les evenements d'une liste d'ids avec une seule requete par tranche de
 * MAX_EVENT_IDS_PER_LOOKUP ids (une seule requete dans le cas courant), puis
 * restitue le resultat dans l'ordre des ids d'entree. Les ids introuvables sont
 * ignores silencieusement, les doublons d'entree sont conserves.
 */
export async function findEventsInOrder(
  lookup: EventsBatchLookup,
  ids: string[],
): Promise<EventEntity[]> {
  const unique = [...new Set(ids)];
  const byId = new Map<string, EventEntity>();

  for (let start = 0; start < unique.length; start += MAX_EVENT_IDS_PER_LOOKUP) {
    const chunk = unique.slice(start, start + MAX_EVENT_IDS_PER_LOOKUP);
    const found = await lookup.findByIds(chunk);
    for (const entity of found) {
      byId.set(entity.id, entity);
    }
  }

  const ordered: EventEntity[] = [];
  for (const id of ids) {
    const entity = byId.get(id);
    if (entity) ordered.push(entity);
  }
  return ordered;
}

/** Construit les metadonnees de pagination a partir d'un total fourni par un autre service. */
export function buildPaginationResponse(
  total: number,
  page: number,
  limit: number,
): PaginationResponse {
  return { total, page, limit, totalPages: limit > 0 ? Math.ceil(total / limit) : 0 };
}
