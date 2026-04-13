import type { DeleteEventCommand } from '@volontariapp/contracts-nest';
import { IsUUID } from 'class-validator';

export class DeleteEventCommandDTO implements DeleteEventCommand {
  @IsUUID()
  id!: string;
}
