import { GetEventsByIdsQuery } from '@volontariapp/contracts-nest';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class GetEventsByIdsQueryDTO implements GetEventsByIdsQuery {
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids!: string[];
}
