import type { CreateEventCommandDTO } from '../../modules/event/dto/request/command/create-event.command.dto.js';
import { EventType } from '@volontariapp/contracts-nest';
import { GrpcDateMapper } from '@volontariapp/contracts-nest';

export class CreateEventCommandFactory {
  static create(overrides?: Partial<CreateEventCommandDTO>): CreateEventCommandDTO {
    const now = new Date();
    const startAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 2 * 60 * 60 * 1000);

    return {
      title: 'Test Event',
      description: 'Test event description',
      startAt: GrpcDateMapper.toTimestamp(startAt),
      endAt: GrpcDateMapper.toTimestamp(endAt),
      localisationName: 'Test Location',
      type: EventType.EVENT_TYPE_SOCIAL,
      awardedImpactScore: 10,
      maxParticipants: 50,
      tagIds: [],
      ...overrides,
    };
  }
}
