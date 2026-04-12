import type { UpdateEventCommand, Event } from '@volontariapp/contracts-nest';

export class UpdateEventCommandDTO implements UpdateEventCommand {
  id!: string;
  event: Event | undefined;
  updateMask!: string[];
}
