import type { DeleteTagCommand } from '@volontariapp/contracts-nest';

export class DeleteTagCommandDTO implements DeleteTagCommand {
  id!: string;
}
