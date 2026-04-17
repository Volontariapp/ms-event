import { EventType, EventState } from '@volontariapp/contracts-nest';
import { CreateEventCommandDTO } from '../../modules/event/dto/request/command/create-event.command.dto.js';
import { UpdateEventCommandDTO } from '../../modules/event/dto/request/command/update-event.command.dto.js';
import { ChangeEventStateCommandDTO } from '../../modules/event/dto/request/command/change-event-state.command.dto.js';
import { SearchEventsQueryDTO } from '../../modules/event/dto/request/query/search-events.query.dto.js';

export const createCreateEventDTO = (
  overrides?: Partial<CreateEventCommandDTO>,
): CreateEventCommandDTO => {
  const dto = new CreateEventCommandDTO();
  dto.title =
    overrides && 'title' in overrides ? overrides.title! : 'Test Event';
  dto.description =
    overrides && 'description' in overrides
      ? overrides.description!
      : 'Test Description';
  dto.localisationName =
    overrides && 'localisationName' in overrides
      ? overrides.localisationName!
      : 'Paris';
  dto.type =
    overrides && 'type' in overrides
      ? overrides.type!
      : EventType.EVENT_TYPE_SOCIAL;
  dto.awardedImpactScore =
    overrides && 'awardedImpactScore' in overrides
      ? overrides.awardedImpactScore!
      : 10;
  dto.maxParticipants =
    overrides && 'maxParticipants' in overrides
      ? overrides.maxParticipants!
      : 100;
  dto.tagIds =
    overrides && 'tagIds' in overrides
      ? overrides.tagIds!
      : ['550e8400-e29b-41d4-a716-446655440000'];
  dto.startAt = overrides?.startAt;
  dto.endAt = overrides?.endAt;
  return dto;
};

export const createUpdateEventDTO = (
  overrides?: Partial<UpdateEventCommandDTO>,
): UpdateEventCommandDTO => {
  const dto = new UpdateEventCommandDTO();
  dto.id =
    overrides && 'id' in overrides
      ? overrides.id!
      : '550e8400-e29b-41d4-a716-446655440000';
  dto.updateMask =
    overrides && 'updateMask' in overrides ? overrides.updateMask! : ['title'];
  dto.event = overrides?.event as any;
  return dto;
};

export const createChangeEventStateDTO = (
  overrides?: Partial<ChangeEventStateCommandDTO>,
): ChangeEventStateCommandDTO => {
  const dto = new ChangeEventStateCommandDTO();
  dto.id =
    overrides && 'id' in overrides
      ? overrides.id!
      : '550e8400-e29b-41d4-a716-446655440000';
  dto.newState =
    overrides && 'newState' in overrides
      ? overrides.newState!
      : EventState.EVENT_STATE_PUBLISHED;
  return dto;
};

export const createSearchEventsQueryDTO = (
  overrides?: Partial<SearchEventsQueryDTO>,
): SearchEventsQueryDTO => {
  const dto = new SearchEventsQueryDTO();
  dto.types =
    overrides && 'types' in overrides
      ? overrides.types!
      : [EventType.EVENT_TYPE_SOCIAL];
  dto.onlyAvailable =
    overrides && 'onlyAvailable' in overrides ? overrides.onlyAvailable! : true;
  dto.organizerId =
    overrides && 'organizerId' in overrides
      ? overrides.organizerId!
      : (undefined as any);
  return dto;
};
