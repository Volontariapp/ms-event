import type { CreateTagCommand } from '@volontariapp/contracts-nest';
import { TagsNames } from '@volontariapp/shared';
import { IsEnum, IsString } from 'class-validator';

export class CreateTagCommandDTO implements CreateTagCommand {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsEnum(TagsNames)
  balise!: string;
}
