import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { MAX_EVENT_IDS_PER_LOOKUP } from '@volontariapp/domain-event';
import {
  buildPaginationResponse,
  findEventsInOrder,
} from '../../../modules/event/utils/events-by-ids.util.js';
import { createEventEntity } from '../../factories/event-entity.factory.js';
import { createEventServiceQueryMock } from '../../mocks/event-query.mock.js';

describe('findEventsInOrder (Unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should issue a single findByIds call and keep the input order', async () => {
    const lookup = createEventServiceQueryMock();
    lookup.findByIds.mockResolvedValue([createEventEntity('a'), createEventEntity('b')]);

    const result = await findEventsInOrder(lookup, ['b', 'a']);

    expect(lookup.findByIds).toHaveBeenCalledTimes(1);
    expect(result.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('should silently ignore unknown ids', async () => {
    const lookup = createEventServiceQueryMock();
    lookup.findByIds.mockResolvedValue([createEventEntity('a')]);

    const result = await findEventsInOrder(lookup, ['x', 'a', 'y']);

    expect(result.map((e) => e.id)).toEqual(['a']);
  });

  it('should not query for an empty list', async () => {
    const lookup = createEventServiceQueryMock();
    lookup.findByIds.mockResolvedValue([]);

    expect(await findEventsInOrder(lookup, [])).toEqual([]);
    expect(lookup.findByIds).not.toHaveBeenCalled();
  });

  it('should dedupe the query but keep duplicated input positions', async () => {
    const lookup = createEventServiceQueryMock();
    lookup.findByIds.mockResolvedValue([createEventEntity('a')]);

    const result = await findEventsInOrder(lookup, ['a', 'a']);

    expect(lookup.findByIds).toHaveBeenCalledWith(['a']);
    expect(result.map((e) => e.id)).toEqual(['a', 'a']);
  });

  it('should chunk lists above the per-lookup cap and keep global order', async () => {
    const lookup = createEventServiceQueryMock();
    const ids = Array.from({ length: MAX_EVENT_IDS_PER_LOOKUP + 5 }, (_, i) => `id-${String(i)}`);
    lookup.findByIds.mockImplementation((chunk) =>
      Promise.resolve([...chunk].reverse().map((id) => createEventEntity(id))),
    );

    const result = await findEventsInOrder(lookup, ids);

    expect(lookup.findByIds).toHaveBeenCalledTimes(2);
    expect(lookup.findByIds.mock.calls[0][0]).toHaveLength(MAX_EVENT_IDS_PER_LOOKUP);
    expect(result.map((e) => e.id)).toEqual(ids);
  });
});

describe('buildPaginationResponse (Unit)', () => {
  it.each([
    { total: 25, page: 2, limit: 10, totalPages: 3 },
    { total: 20, page: 1, limit: 10, totalPages: 2 },
    { total: 0, page: 1, limit: 10, totalPages: 0 },
  ])('should compute totalPages for %j', ({ total, page, limit, totalPages }) => {
    expect(buildPaginationResponse(total, page, limit)).toEqual({ total, page, limit, totalPages });
  });
});
