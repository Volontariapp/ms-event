import type {
  CreateEventCommand,
  EventType,
  Point,
  Timestamp,
} from '@volontariapp/contracts-nest';

export class CreateEventCommandDTO implements CreateEventCommand {
  title!: string;
  description!: string;
  startAt: Timestamp | undefined;
  endAt: Timestamp | undefined;
  location!: Point;
  localisationName!: string;
  type!: EventType;
  awardedImpactScore!: number;
  maxParticipants!: number;
  tagIds!: string[];
}
