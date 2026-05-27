import { GetEventsByIdsQuery } from '@volontariapp/contracts-nest';
import { IsArray, IsString } from 'class-validator';

export class GetEventsByIdsQueryDTO implements GetEventsByIdsQuery {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}
