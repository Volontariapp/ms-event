import { describe, expect, it } from '@jest/globals';
import { EventState, EventType } from '@volontariapp/contracts';
import type { SearchAdvancedVO } from '@volontariapp/domain-event';
import {
  EVENT_SEARCH_TOTAL_CACHE_CAPACITY,
  EVENT_SEARCH_TOTAL_CACHE_TTL_MS,
  EventSearchTotalCache,
} from '../../../modules/event/providers/event-search-total-cache.provider.js';
import {
  createSearchAdvancedVO,
  type SearchAdvancedFields,
} from '../../factories/search-advanced.factory.js';

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';
const ID_C = '33333333-3333-4333-8333-333333333333';

describe('EventSearchTotalCache', () => {
  const createClock = (start = 1000) => {
    let current = start;
    return {
      now: () => current,
      advance: (ms: number) => {
        current += ms;
      },
    };
  };

  it('uses a 10 s ttl, a 5000 entries bound and the event-search-total name by default', () => {
    const cache = new EventSearchTotalCache();
    expect(EVENT_SEARCH_TOTAL_CACHE_TTL_MS).toBe(10_000);
    expect(EVENT_SEARCH_TOTAL_CACHE_CAPACITY).toBe(5000);
    expect(cache.stats()).toEqual(
      expect.objectContaining({ name: 'event-search-total', capacity: 5000 }),
    );
  });

  it('returns undefined on a miss', () => {
    const cache = new EventSearchTotalCache(createClock().now);
    expect(cache.get('k')).toBeUndefined();
  });

  it('returns the stored total on a hit before expiry', () => {
    const clock = createClock();
    const cache = new EventSearchTotalCache(clock.now, 10_000, 10);
    cache.set('k', 42);
    clock.advance(9_999);
    expect(cache.get('k')).toBe(42);
  });

  it('expires the entry once the ttl has elapsed', () => {
    const clock = createClock();
    const cache = new EventSearchTotalCache(clock.now, 10_000, 10);
    cache.set('k', 42);
    clock.advance(10_000);
    expect(cache.get('k')).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('evicts the oldest entry when the capacity is reached', () => {
    const cache = new EventSearchTotalCache(createClock().now, 10_000, 2);
    cache.set('k1', 1);
    cache.set('k2', 2);
    cache.set('k3', 3);
    expect(cache.get('k1')).toBeUndefined();
    expect(cache.get('k2')).toBe(2);
    expect(cache.get('k3')).toBe(3);
    expect(cache.size).toBe(2);
  });

  it('does not evict when overwriting an existing key at capacity', () => {
    const cache = new EventSearchTotalCache(createClock().now, 10_000, 2);
    cache.set('k1', 1);
    cache.set('k2', 2);
    cache.set('k2', 20);
    expect(cache.get('k1')).toBe(1);
    expect(cache.get('k2')).toBe(20);
  });

  describe('stats', () => {
    it('counts hits, misses (unknown and expired keys) and evictions', () => {
      const clock = createClock();
      const cache = new EventSearchTotalCache(clock.now, 10_000, 2);
      cache.get('k1');
      cache.set('k1', 1);
      cache.get('k1');
      cache.get('k1');
      cache.set('k2', 2);
      cache.set('k3', 3);
      clock.advance(10_000);
      cache.get('k2');

      expect(cache.stats()).toEqual({
        name: 'event-search-total',
        hits: 2,
        misses: 2,
        evictions: 1,
        size: 1,
        capacity: 2,
      });
    });

    it('restarts the counters on reset', () => {
      const cache = new EventSearchTotalCache(createClock().now, 10_000, 2);
      cache.set('k1', 1);
      cache.get('k1');
      cache.get('x');

      cache.resetStats();

      expect(cache.stats()).toEqual(expect.objectContaining({ hits: 0, misses: 0, evictions: 0 }));
    });
  });

  describe('buildKey', () => {
    const key = (vo: SearchAdvancedVO): string => EventSearchTotalCache.buildKey(vo);

    it('is a short sha1 fingerprint, even for 2000 ids', () => {
      const ids = Array.from({ length: 2000 }, (_, i) => `${String(i).padStart(8, '0')}-0000`);
      expect(key(createSearchAdvancedVO({ excludedIds: ids }))).toMatch(/^[0-9a-f]{40}$/);
    });

    it('ignores page and limit', () => {
      expect(key(createSearchAdvancedVO({ page: 1, limit: 10 }))).toBe(
        key(createSearchAdvancedVO({ page: 7, limit: 50 })),
      );
    });

    it('ignores the order of the set-like lists', () => {
      expect(
        key(
          createSearchAdvancedVO({
            ids: [ID_A, ID_B],
            excludedIds: [ID_B, ID_C],
            excludedOrganizerIds: [ID_A, ID_C],
            tagSlugs: ['a', 'b'],
            types: [EventType.EVENT_TYPE_SOCIAL, EventType.EVENT_TYPE_ECOLOGY],
            statuses: [EventState.EVENT_STATE_PUBLISHED, EventState.EVENT_STATE_FINISHED],
          }),
        ),
      ).toBe(
        key(
          createSearchAdvancedVO({
            ids: [ID_B, ID_A],
            excludedIds: [ID_C, ID_B],
            excludedOrganizerIds: [ID_C, ID_A],
            tagSlugs: ['b', 'a'],
            types: [EventType.EVENT_TYPE_ECOLOGY, EventType.EVENT_TYPE_SOCIAL],
            statuses: [EventState.EVENT_STATE_FINISHED, EventState.EVENT_STATE_PUBLISHED],
          }),
        ),
      );
    });

    it('does not move an id from one list to another', () => {
      expect(key(createSearchAdvancedVO({ ids: [ID_A] }))).not.toBe(
        key(createSearchAdvancedVO({ excludedIds: [ID_A] })),
      );
      expect(key(createSearchAdvancedVO({ excludedIds: [ID_A] }))).not.toBe(
        key(createSearchAdvancedVO({ excludedOrganizerIds: [ID_A] })),
      );
    });

    it('does not join list items into a shared string', () => {
      expect(key(createSearchAdvancedVO({ tagSlugs: ['a,b'] }))).not.toBe(
        key(createSearchAdvancedVO({ tagSlugs: ['a', 'b'] })),
      );
    });

    it('tells an absent list from an empty one', () => {
      expect(key(createSearchAdvancedVO({ ids: undefined }))).not.toBe(
        key(createSearchAdvancedVO({ ids: [] })),
      );
    });

    const baseFields: SearchAdvancedFields = {
      area: { lat: 48.85, lng: 2.35, radiusInMeters: 5000 },
      types: [EventType.EVENT_TYPE_SOCIAL],
      tagSlugs: ['nature'],
      onlyAvailable: true,
      searchTerm: 'run',
      organizerId: ID_A,
      ids: [ID_A, ID_B],
      excludedIds: [ID_C],
      startDateFrom: new Date('2026-11-01T00:00:00.000Z'),
      startDateTo: new Date('2026-11-30T00:00:00.000Z'),
      statuses: [EventState.EVENT_STATE_PUBLISHED],
      excludedOrganizerIds: [ID_B],
      endAtFrom: new Date('2026-11-09T10:00:00.000Z'),
    };
    const base = createSearchAdvancedVO(baseFields);

    it.each<[string, SearchAdvancedFields]>([
      ['area latitude', { area: { lat: 48.86, lng: 2.35, radiusInMeters: 5000 } }],
      ['area longitude', { area: { lat: 48.85, lng: 2.36, radiusInMeters: 5000 } }],
      ['area radius', { area: { lat: 48.85, lng: 2.35, radiusInMeters: 5001 } }],
      ['no area', { area: undefined }],
      ['types', { types: [EventType.EVENT_TYPE_ECOLOGY] }],
      ['tag slugs', { tagSlugs: ['nature', 'sport'] }],
      ['onlyAvailable', { onlyAvailable: false }],
      ['search term', { searchTerm: 'Run' }],
      ['organizer', { organizerId: ID_B }],
      ['ids', { ids: [ID_A] }],
      ['excluded ids', { excludedIds: [ID_C, ID_A] }],
      ['start date from', { startDateFrom: new Date('2026-11-02T00:00:00.000Z') }],
      ['start date to', { startDateTo: new Date('2026-11-29T00:00:00.000Z') }],
      ['statuses', { statuses: [EventState.EVENT_STATE_FINISHED] }],
      ['excluded organizers', { excludedOrganizerIds: [ID_C] }],
      ['end at from', { endAtFrom: undefined }],
    ])('changes with the %s', (_field, override) => {
      expect(key(createSearchAdvancedVO({ ...baseFields, ...override }))).not.toBe(key(base));
    });
  });
});
