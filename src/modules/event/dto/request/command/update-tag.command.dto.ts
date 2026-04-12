import type { UpdateTagCommand } from '@volontariapp/contracts-nest';

export class UpdateTagCommandDTO implements UpdateTagCommand {
  id!: string;
  name!: string;
  color!: string;
}
