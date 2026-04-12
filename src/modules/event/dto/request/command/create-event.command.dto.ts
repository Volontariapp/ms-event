import type {
  CreateEventCommand,
  EventType,
  Point,
} from '@volontariapp/contracts-nest';

export class CreateEventCommandDTO implements CreateEventCommand {
  title!: string;
  description!: string;
  startAt!: Date;
  endAt!: Date;
  location!: Point;
  localisationName!: string;
  type!: EventType;
  awardedImpactScore!: number;
  maxParticipants!: number;
  tagIds!: string[];
}
