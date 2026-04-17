import type { UpdateTagCommand } from '@volontariapp/contracts-nest';
import { TagsNames } from '@volontariapp/shared';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export class UpdateTagCommandDTO implements UpdateTagCommand {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;
  @IsEnum(TagsNames)
  balise!: string;
}
