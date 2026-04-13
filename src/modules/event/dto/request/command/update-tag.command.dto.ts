import type { UpdateTagCommand } from '@volontariapp/contracts-nest';
import { IsHexColor, IsString, IsUUID } from 'class-validator';

export class UpdateTagCommandDTO implements UpdateTagCommand {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;
  @IsHexColor()
  color!: string;
}
