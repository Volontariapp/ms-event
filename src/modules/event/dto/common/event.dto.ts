import type {
  Event,
  EventState,
  EventType,
  Point,
  Tag,
  Requirement,
} from '@volontariapp/contracts-nest';
import type { TimestampDTO } from './timestamp.dto.js';

export class EventDTO implements Event {
  currentParticipants!: number;
  id!: string;
  title!: string;
  description!: string;
  startAt!: TimestampDTO;
  endAt!: TimestampDTO;
  location: Point | undefined;
  localisationName!: string;
  type!: EventType;
  awardedImpactScore!: number;
  maxParticipants!: number;
  tags!: Tag[];
  requirements!: Requirement[];
  organizerId!: string;
  state!: EventState;
  createdAt!: TimestampDTO;
  updatedAt!: TimestampDTO;
}
