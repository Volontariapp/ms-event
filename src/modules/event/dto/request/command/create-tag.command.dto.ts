import type { CreateTagCommand } from '@volontariapp/contracts-nest';
import { IsHexColor, IsString } from 'class-validator';

export class CreateTagCommandDTO implements CreateTagCommand {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsHexColor()
  color!: string;
}
