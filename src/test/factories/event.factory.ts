import { EventType, EventState } from '@volontariapp/contracts-nest';
import { CreateEventCommandDTO } from '../../modules/event/dto/request/command/create-event.command.dto.js';
import { UpdateEventCommandDTO } from '../../modules/event/dto/request/command/update-event.command.dto.js';
import { ChangeEventStateCommandDTO } from '../../modules/event/dto/request/command/change-event-state.command.dto.js';
import { SearchEventsQueryDTO } from '../../modules/event/dto/request/query/search-events.query.dto.js';

export const createCreateEventDTO = (
  overrides?: Partial<CreateEventCommandDTO>,
): CreateEventCommandDTO => {
  const dto = new CreateEventCommandDTO();
  const defaults: Partial<CreateEventCommandDTO> = {
    title: 'Test Event',
    description: 'Test Description',
    localisationName: 'Paris',
    type: EventType.EVENT_TYPE_SOCIAL,
    awardedImpactScore: 10,
    maxParticipants: 100,
    tagIds: ['550e8400-e29b-41d4-a716-446655440000'],
  };
  Object.assign(dto, defaults, overrides ?? {});
  return dto;
};

export const createUpdateEventDTO = (
  overrides?: Partial<UpdateEventCommandDTO>,
): UpdateEventCommandDTO => {
  const dto = new UpdateEventCommandDTO();
  const defaults: Partial<UpdateEventCommandDTO> = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    updateMask: ['title'],
  };
  Object.assign(dto, defaults, overrides ?? {});
  return dto;
};

export const createChangeEventStateDTO = (
  overrides?: Partial<ChangeEventStateCommandDTO>,
): ChangeEventStateCommandDTO => {
  const dto = new ChangeEventStateCommandDTO();
  const defaults: Partial<ChangeEventStateCommandDTO> = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    newState: EventState.EVENT_STATE_PUBLISHED,
  };
  Object.assign(dto, defaults, overrides ?? {});
  return dto;
};

export const createSearchEventsQueryDTO = (
  overrides?: Partial<SearchEventsQueryDTO>,
): SearchEventsQueryDTO => {
  const dto = new SearchEventsQueryDTO();
  const defaults: Partial<SearchEventsQueryDTO> = {
    types: [EventType.EVENT_TYPE_SOCIAL],
    onlyAvailable: true,
  };
  Object.assign(dto, defaults, overrides ?? {});
  return dto;
};
