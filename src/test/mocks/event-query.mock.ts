import { jest } from '@jest/globals';
import type {
  PaginatedEventsVO,
  SearchAdvancedOptions,
  SearchAdvancedVO,
} from '@volontariapp/domain-event';
import type { EventEntity } from '@volontariapp/domain-event';
import type { EventsBatchLookup } from '../../modules/event/utils/events-by-ids.util.js';

type SearchAdvancedFn = (
  params: SearchAdvancedVO,
  options?: SearchAdvancedOptions,
) => Promise<PaginatedEventsVO>;

export interface EventServiceQueryMock extends EventsBatchLookup {
  findByIds: jest.Mock<(ids: string[]) => Promise<EventEntity[]>>;
  findById: jest.Mock<(id: string) => Promise<EventEntity>>;
  searchAdvanced: jest.Mock<SearchAdvancedFn>;
}

export const createEventServiceQueryMock = (): EventServiceQueryMock => ({
  findByIds: jest.fn<(ids: string[]) => Promise<EventEntity[]>>(),
  findById: jest.fn<(id: string) => Promise<EventEntity>>(),
  searchAdvanced: jest.fn<SearchAdvancedFn>(),
});

export interface SocialClientMock {
  getUserCreatedEvents: jest.Mock<
    (token: string, limit: number, page: number) => Promise<{ ids: string[]; totalCount: number }>
  >;
  getUserParticipatedEvents: SocialClientMock['getUserCreatedEvents'];
  getUserWishedEvents: SocialClientMock['getUserCreatedEvents'];
}

export const createSocialClientMock = (): SocialClientMock => ({
  getUserCreatedEvents: jest.fn(),
  getUserParticipatedEvents: jest.fn(),
  getUserWishedEvents: jest.fn(),
});
