import type {
  Event,
  EventState,
  EventType,
  Point,
  Tag,
  Requirement,
} from '@volontariapp/contracts-nest';

export class EventDTO implements Event {
  currentParticipants!: number;
  id!: string;
  title!: string;
  description!: string;
  startAt!: Date;
  endAt!: Date;
  location: Point | undefined;
  localisationName!: string;
  type!: EventType;
  awardedImpactScore!: number;
  maxParticipants!: number;
  tags!: Tag[];
  requirements!: Requirement[];
  organizerId!: string;
  state!: EventState;
  createdAt!: Date;
  updatedAt!: Date;
}
