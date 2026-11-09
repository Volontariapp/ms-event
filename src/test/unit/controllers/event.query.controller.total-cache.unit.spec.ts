import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { EventService, PaginatedEventsVO } from '@volontariapp/domain-event';
import { EventType } from '@volontariapp/contracts-nest';
import type { AuthUser } from '@volontariapp/auth';
import { UserRoles } from '@volontariapp/shared';
import { SocialParticipationQueryClientService } from '../../../modules/event/clients/social-participation.query-client.js';
import { EventQueryController } from '../../../modules/event/controllers/queries/event.query.controller.js';
import { EventSearchTotalCache } from '../../../modules/event/providers/event-search-total-cache.provider.js';
import {
  EventTransformer,
  RequirementTransformer,
  TagTransformer,
} from '../../../modules/event/transformers/index.js';
import type { SearchEventsQueryDTO } from '../../../modules/event/dto/request/query/search-events.query.dto.js';
import { createSearchEventsQueryDTO } from '../../factories/event.factory.js';
import { createEventEntity } from '../../factories/event-entity.factory.js';
import {
  createEventServiceQueryMock,
  createSocialClientMock,
  type EventServiceQueryMock,
} from '../../mocks/event-query.mock.js';

const user: AuthUser = { id: 'user-1', role: UserRoles.VOLUNTEER };
const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';
const PARIS = { center: { latitude: 48.85, longitude: 2.35 }, radiusMeters: 5000 };
const LYON = { center: { latitude: 45.76, longitude: 4.83 }, radiusMeters: 5000 };

describe('EventQueryController search total cache', () => {
  let eventService: EventServiceQueryMock;
  let controller: EventQueryController;
  let cache: EventSearchTotalCache;
  let clock: number;

  beforeEach(async () => {
    clock = 0;
    eventService = createEventServiceQueryMock();
    eventService.searchAdvanced.mockImplementation((params) =>
      Promise.resolve(
        new PaginatedEventsVO([createEventEntity('a')], 42, params.page, params.limit),
      ),
    );
    const moduleRef = await Test.createTestingModule({
      controllers: [EventQueryController],
      providers: [
        EventTransformer,
        RequirementTransformer,
        TagTransformer,
        { provide: EventService, useValue: eventService },
        { provide: SocialParticipationQueryClientService, useValue: createSocialClientMock() },
        {
          provide: EventSearchTotalCache,
          useFactory: (): EventSearchTotalCache =>
            new EventSearchTotalCache(() => clock, 10_000, 10),
        },
      ],
    }).compile();
    controller = moduleRef.get(EventQueryController);
    cache = moduleRef.get(EventSearchTotalCache);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const filter = (overrides: Parameters<typeof createSearchEventsQueryDTO>[0] = {}) =>
    createSearchEventsQueryDTO({
      statuses: [],
      area: PARIS,
      excludedIds: [ID_A],
      types: [EventType.EVENT_TYPE_SOCIAL],
      ...overrides,
    });

  it('counts on the first page, then passes knownTotal for the next page of the same filter', async () => {
    await controller.searchEvents(filter({ pagination: { page: 1, limit: 10 } }), user);
    const second = await controller.searchEvents(
      filter({ pagination: { page: 2, limit: 20 } }),
      user,
    );

    expect(eventService.searchAdvanced).toHaveBeenCalledTimes(2);
    expect(eventService.searchAdvanced.mock.calls[0]).toHaveLength(1);
    expect(eventService.searchAdvanced).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ page: 2, limit: 20 }),
      { knownTotal: 42 },
    );
    expect(second.totalCount).toBe(42);
    expect(second.pagination).toEqual({ total: 42, page: 2, limit: 20, totalPages: 3 });
  });

  it.each<[string, Partial<SearchEventsQueryDTO>]>([
    ['excluded ids', { excludedIds: [ID_B] }],
    ['ids', { ids: [ID_A] }],
    ['excluded organizers', { excludedOrganizerIds: [ID_A] }],
    ['area', { area: LYON }],
    ['tag slugs', { tagSlugs: ['nature'] }],
  ])('does not share the total with a filter on other %s', async (_field, override) => {
    await controller.searchEvents(filter(), user);
    await controller.searchEvents(filter(override), user);

    expect(eventService.searchAdvanced.mock.calls[1]).toHaveLength(1);
  });

  it('counts again once the ttl has elapsed', async () => {
    await controller.searchEvents(filter(), user);
    clock = 10_000;
    await controller.searchEvents(filter(), user);

    expect(eventService.searchAdvanced.mock.calls[1]).toHaveLength(1);
  });

  it('never caches when the search fails', async () => {
    eventService.searchAdvanced.mockRejectedValueOnce(new Error('db down'));

    await expect(controller.searchEvents(filter(), user)).rejects.toThrow('db down');
    await controller.searchEvents(filter(), user);

    expect(eventService.searchAdvanced.mock.calls[1]).toHaveLength(1);
    expect(cache.size).toBe(1);
  });

  it('counts one miss then one hit for two pages of the same filter', async () => {
    await controller.searchEvents(filter({ pagination: { page: 1, limit: 10 } }), user);
    await controller.searchEvents(filter({ pagination: { page: 2, limit: 10 } }), user);

    expect(cache.stats()).toEqual(
      expect.objectContaining({ name: 'event-search-total', hits: 1, misses: 1, size: 1 }),
    );
  });
});
