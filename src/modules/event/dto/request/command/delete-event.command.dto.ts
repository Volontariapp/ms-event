import type { DeleteEventCommand } from '@volontariapp/contracts-nest';

export class DeleteEventCommandDTO implements DeleteEventCommand {
  id!: string;
}
