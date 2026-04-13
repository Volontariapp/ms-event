import type { DeleteTagCommand } from '@volontariapp/contracts-nest';
import { IsUUID } from 'class-validator';

export class DeleteTagCommandDTO implements DeleteTagCommand {
  @IsUUID()
  id!: string;
}
