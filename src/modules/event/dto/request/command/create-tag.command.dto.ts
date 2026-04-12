import type { CreateTagCommand } from '@volontariapp/contracts-nest';

export class CreateTagCommandDTO implements CreateTagCommand {
  slug!: string;
  name!: string;
  color!: string;
}
