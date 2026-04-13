import type {
  Event,
  EventState,
  EventType,
  Point,
  Tag,
  Requirement,
  Timestamp,
} from '@volontariapp/contracts-nest';

export class EventDTO implements Event {
  id!: string;
  title!: string;
  description!: string;
  startAt: Timestamp | undefined;
  endAt: Timestamp | undefined;
  location: Point | undefined;
  localisationName!: string;
  type!: EventType;
  state!: EventState;
  awardedImpactScore!: number;
  maxParticipants!: number;
  currentParticipants!: number;
  organizerId!: string;
  tags!: Tag[];
  requirements!: Requirement[];
  createdAt: Timestamp | undefined;
  updatedAt: Timestamp | undefined;
}
