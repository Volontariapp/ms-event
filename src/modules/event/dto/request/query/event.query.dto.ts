import type {
  GetEventQuery,
  ListRequirementsQuery,
  GetTagsQuery,
  GetUserCreatedEventsQuery,
  GetUserParticipatedEventsQuery,
  GetUserWishedEventsQuery,
} from '@volontariapp/contracts-nest';
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationRequestDTO } from '../../common/pagination.dto.js';

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

export class GetUserCreatedEventsQueryDTO implements GetUserCreatedEventsQuery {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationRequestDTO)
  pagination: PaginationRequestDTO | undefined;
}

export class GetUserParticipatedEventsQueryDTO implements GetUserParticipatedEventsQuery {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationRequestDTO)
  pagination: PaginationRequestDTO | undefined;
}

export class GetUserWishedEventsQueryDTO implements GetUserWishedEventsQuery {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationRequestDTO)
  pagination: PaginationRequestDTO | undefined;
}
