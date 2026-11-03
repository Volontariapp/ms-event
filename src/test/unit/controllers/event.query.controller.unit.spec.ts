import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { EventService, PaginatedEventsVO } from '@volontariapp/domain-event';
import type { AuthUser } from '@volontariapp/auth';
import { UserRoles } from '@volontariapp/shared';
import { SocialParticipationQueryClientService } from '../../../modules/event/clients/social-participation.query-client.js';
import { EventQueryController } from '../../../modules/event/controllers/queries/event.query.controller.js';
import {
  EventTransformer,
  RequirementTransformer,
  TagTransformer,
} from '../../../modules/event/transformers/index.js';
import { GetEventsByIdsQueryDTO } from '../../../modules/event/dto/request/query/get-events-by-ids.query.dto.js';
import { createSearchEventsQueryDTO } from '../../factories/event.factory.js';
import { createEventEntity } from '../../factories/event-entity.factory.js';
import {
  createEventServiceQueryMock,
  createSocialClientMock,
  type EventServiceQueryMock,
  type SocialClientMock,
} from '../../mocks/event-query.mock.js';

const user: AuthUser = { id: 'user-1', role: UserRoles.VOLUNTEER };

describe('EventQueryController (Unit)', () => {
  let eventService: EventServiceQueryMock;
  let social: SocialClientMock;
  let controller: EventQueryController;

  beforeEach(async () => {
    eventService = createEventServiceQueryMock();
    social = createSocialClientMock();
    const moduleRef = await Test.createTestingModule({
      controllers: [EventQueryController],
      providers: [
        EventTransformer,
        RequirementTransformer,
        TagTransformer,
        { provide: EventService, useValue: eventService },
        { provide: SocialParticipationQueryClientService, useValue: social },
      ],
    }).compile();
    controller = moduleRef.get(EventQueryController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getEventsByIds', () => {
    it('should use a single findByIds, keep the order and ignore unknown ids', async () => {
      eventService.findByIds.mockResolvedValue([createEventEntity('a'), createEventEntity('c')]);
      const dto = new GetEventsByIdsQueryDTO();
      dto.ids = ['c', 'unknown', 'a'];

      const res = await controller.getEventsByIds(dto, user);

      expect(eventService.findByIds).toHaveBeenCalledTimes(1);
      expect(eventService.findById).not.toHaveBeenCalled();
      expect(res.events.map((e) => e.id)).toEqual(['c', 'a']);
      expect(res.totalCount).toBe(2);
    });
  });

  describe('searchEvents', () => {
    it('should fill pagination from PaginatedEventsVO and keep totalCount', async () => {
      eventService.searchAdvanced.mockResolvedValue(
        new PaginatedEventsVO([createEventEntity('a')], 25, 2, 10),
      );

      const res = await controller.searchEvents(createSearchEventsQueryDTO({ statuses: [] }), user);

      expect(res.totalCount).toBe(25);
      expect(res.pagination).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
    });
  });

  describe.each([
    { name: 'getUserCreatedEvents', client: 'getUserCreatedEvents' },
    { name: 'getUserParticipatedEvents', client: 'getUserParticipatedEvents' },
    { name: 'getUserWishedEvents', client: 'getUserWishedEvents' },
  ] as const)('$name', ({ name, client }) => {
    it('should batch the lookup, keep ms-social order and fill pagination', async () => {
      social[client].mockResolvedValue({ ids: ['z', 'gone', 'a'], totalCount: 25 });
      eventService.findByIds.mockResolvedValue([createEventEntity('a'), createEventEntity('z')]);

      const res = await controller[name]({ pagination: { page: 2, limit: 10 } }, user, 'tok');

      expect(social[client]).toHaveBeenCalledWith('tok', 10, 2);
      expect(eventService.findByIds).toHaveBeenCalledTimes(1);
      expect(eventService.findById).not.toHaveBeenCalled();
      expect(res.events.map((e) => e.id)).toEqual(['z', 'a']);
      expect(res.totalCount).toBe(25);
      expect(res.pagination).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
    });

    it('should default to page 1 and limit 10', async () => {
      social[client].mockResolvedValue({ ids: [], totalCount: 0 });

      const res = await controller[name]({ pagination: undefined }, user, 'tok');

      expect(social[client]).toHaveBeenCalledWith('tok', 10, 1);
      expect(res.pagination).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
      expect(eventService.findByIds).not.toHaveBeenCalled();
    });
  });
});
