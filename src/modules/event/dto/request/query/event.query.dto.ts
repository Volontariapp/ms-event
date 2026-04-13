import type {
  GetEventQuery,
  ListRequirementsQuery,
  GetTagsQuery,
} from '@volontariapp/contracts-nest';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class GetEventQueryDTO implements GetEventQuery {
  @IsUUID()
  id!: string;
}

export class ListRequirementsQueryDTO implements ListRequirementsQuery {
  @IsUUID()
  eventId!: string;
}

export class GetTagsQueryDTO implements GetTagsQuery {
  @IsArray()
  @IsString({ each: true })
  slugs!: string[];
}
