import { EventEntity, EventLocation } from '@volontariapp/domain-event';
import { CoverStatus, EventState, EventType } from '@volontariapp/contracts-nest';

export type EventEntityOverrides = Partial<Omit<EventEntity, 'scoringVersion'>> & {
  scoringVersion?: number | null;
};

export class EventEntityFactory {
  static create(overrides: EventEntityOverrides = {}): EventEntity {
    const entity = new EventEntity();
    entity.id = 'default-event-id';
    entity.name = 'Default Event Title';
    entity.description = 'Default Description';
    entity.startAt = new Date('2026-10-15T10:00:00Z');
    entity.endAt = new Date('2026-10-15T12:00:00Z');
    entity.location = new EventLocation(48.8566, 2.3522);
    entity.localisationName = 'Paris';
    entity.type = EventType.EVENT_TYPE_SOCIAL;
    entity.state = EventState.EVENT_STATE_PUBLISHED;
    entity.awardedImpactScore = 10;
    entity.maxParticipants = 50;
    entity.currentParticipants = 0;
    entity.organizerId = '11111111-1111-1111-1111-111111111111';
    entity.createdAt = new Date('2026-10-01T10:00:00Z');
    entity.updatedAt = new Date('2026-10-01T10:00:00Z');
    entity.coverStatus = CoverStatus.COVER_STATUS_NONE;
    entity.tags = [];
    entity.requirements = [];
    Object.assign(entity, overrides);
    return entity;
  }
}
