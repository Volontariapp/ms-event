import { EventEntity, EventLocation } from '@volontariapp/domain-event';
import { CoverStatus, EventState, EventType } from '@volontariapp/contracts-nest';
import { SagaStatus } from '@volontariapp/shared';

export const createEventEntity = (
  id: string,
  overrides: Partial<EventEntity> = {},
): EventEntity => {
  const event = new EventEntity();
  event.id = id;
  event.name = overrides.name ?? `Event ${id}`;
  event.description = 'Description';
  event.startAt = new Date('2026-10-15T10:00:00Z');
  event.endAt = new Date('2026-10-15T12:00:00Z');
  event.location = new EventLocation(48.8566, 2.3522);
  event.localisationName = 'Paris';
  event.type = EventType.EVENT_TYPE_SOCIAL;
  event.state = EventState.EVENT_STATE_PUBLISHED;
  event.saga_status = SagaStatus.PENDING;
  event.awardedImpactScore = 10;
  event.maxParticipants = 50;
  event.currentParticipants = 0;
  event.organizerId = '11111111-1111-1111-1111-111111111111';
  event.createdAt = new Date('2026-10-01T00:00:00Z');
  event.updatedAt = new Date('2026-10-01T00:00:00Z');
  event.coverStatus = CoverStatus.COVER_STATUS_NONE;
  event.tags = [];
  event.requirements = [];
  return Object.assign(event, overrides);
};
