import { createHash } from 'node:crypto';
import type { SearchAdvancedVO } from '@volontariapp/domain-event';
import type { CacheStats, CacheStatsSource } from '../../../common/cache/cache-stats.js';

export type EventSearchTotalClock = () => number;

interface EventSearchTotalEntry {
  readonly total: number;
  readonly expiresAt: number;
}

export const EVENT_SEARCH_TOTAL_CACHE_TTL_MS = 10_000;
/**
 * At 300 req/s, one ttl window holds at most 3 000 searches, so 5 000 entries keep every
 * distinct filter of a window even when no two requests share one. An entry is a 40-char
 * fingerprint plus a number: well under 1 MB at full capacity.
 */
export const EVENT_SEARCH_TOTAL_CACHE_CAPACITY = 5000;

// Code-unit order, not localeCompare: a total order that never depends on the process locale.
const compare = (a: string | number, b: string | number): number => {
  const left = String(a);
  const right = String(b);
  if (left === right) return 0;
  return left < right ? -1 : 1;
};

const sortedCopy = <T extends string | number>(values: readonly T[] | undefined): T[] | null =>
  values === undefined ? null : [...values].sort(compare);

const dateKey = (value: Date | undefined): string | null =>
  value === undefined ? null : String(value.getTime());

/**
 * Bounded TTL cache of the searchEvents total (the COUNT is the costly part of a page: a Seq
 * Scan of events, while the page itself is read by index). The oldest entry is evicted first
 * once the capacity is reached. Mirrors PostsTotalCache in ms-post.
 */
export class EventSearchTotalCache implements CacheStatsSource {
  private readonly entries = new Map<string, EventSearchTotalEntry>();
  // Plain counters, reset by the stats reporter every minute.
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(
    private readonly now: EventSearchTotalClock = Date.now,
    private readonly ttlMs: number = EVENT_SEARCH_TOTAL_CACHE_TTL_MS,
    private readonly capacity: number = EVENT_SEARCH_TOTAL_CACHE_CAPACITY,
    private readonly name: string = 'event-search-total',
  ) {}

  /**
   * The total depends on every filter field but page and limit. Each field keeps its own slot
   * in a JSON array (an id never moves from `ids` to `excludedIds`, list items are never joined
   * into one string, an absent list stays `null` apart from an empty one). Lists are sorted:
   * the repository applies each one as a set (`IN`, `= ANY`, `<> ALL`), so their order never
   * changes the count. The sha1 keeps an entry short when a list carries 2 000 ids.
   */
  static buildKey(params: SearchAdvancedVO): string {
    const canonical = JSON.stringify([
      params.area === undefined
        ? null
        : [params.area.lat, params.area.lng, params.area.radiusInMeters],
      sortedCopy(params.types),
      sortedCopy(params.tagSlugs),
      params.onlyAvailable ?? null,
      params.searchTerm ?? null,
      params.organizerId ?? null,
      sortedCopy(params.ids),
      sortedCopy(params.excludedIds),
      dateKey(params.startDateFrom),
      dateKey(params.startDateTo),
      sortedCopy(params.statuses),
      sortedCopy(params.excludedOrganizerIds),
      dateKey(params.endAtFrom),
    ]);
    return createHash('sha1').update(canonical).digest('hex');
  }

  get(key: string): number | undefined {
    const entry = this.entries.get(key);
    if (entry === undefined) {
      this.misses++;
      return undefined;
    }
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.total;
  }

  set(key: string, total: number): void {
    this.entries.delete(key);
    while (this.entries.size >= this.capacity) {
      const oldest = this.entries.keys().next();
      if (oldest.done === true) {
        break;
      }
      this.entries.delete(oldest.value);
      this.evictions++;
    }
    this.entries.set(key, { total, expiresAt: this.now() + this.ttlMs });
  }

  get size(): number {
    return this.entries.size;
  }

  stats(): CacheStats {
    return {
      name: this.name,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      size: this.entries.size,
      capacity: this.capacity,
    };
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }
}
