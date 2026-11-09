import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SearchEventsQuery, EventType, GeoCircle, EventState } from '@volontariapp/contracts-nest';
import { IsUUIDList } from '../../validators/is-uuid-list.validator.js';
import { PointDTO } from '../../common/point.dto.js';

// Plafond des listes d'identifiants de SearchEvents : 1000 et non 100, car la gateway y
// injecte jusqu'a 1000 identifiants d'evenements recommandes (ids) ou a exclure (excludedIds), et
// d'organisateurs a exclure (excludedOrganizerIds).
export const MAX_SEARCH_IDS = 1000;

export class GeoCircleDTO implements GeoCircle {
  @ValidateNested()
  @Type(() => PointDTO)
  center!: PointDTO;

  @IsNumber()
  radiusMeters!: number;
}

export class SearchEventsQueryDTO implements SearchEventsQuery {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoCircleDTO)
  area: GeoCircleDTO | undefined;

  @IsArray()
  @IsEnum(EventType, { each: true })
  @IsOptional()
  types!: EventType[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagSlugs!: string[];

  @IsBoolean()
  @IsOptional()
  onlyAvailable!: boolean;

  @IsString()
  @IsOptional()
  searchTerm!: string;

  @IsUUID()
  @IsOptional()
  organizerId!: string;

  @IsArray()
  @ArrayMaxSize(MAX_SEARCH_IDS)
  @IsUUIDList()
  @IsOptional()
  ids!: string[];

  @IsArray()
  @ArrayMaxSize(MAX_SEARCH_IDS)
  @IsUUIDList()
  @IsOptional()
  excludedIds!: string[];

  // Organizers whose events are left out (blocked users, the reader's own events).
  @IsArray()
  @ArrayMaxSize(MAX_SEARCH_IDS)
  @IsUUIDList()
  @IsOptional()
  excludedOrganizerIds!: string[];

  @IsString()
  @IsOptional()
  startDateFrom?: string;

  @IsString()
  @IsOptional()
  startDateTo?: string;

  // Keeps events whose end is at or after this instant (live and upcoming events).
  @IsISO8601()
  @IsOptional()
  endAtFrom?: string;

  @IsArray()
  @IsEnum(EventState, { each: true })
  @IsOptional()
  statuses!: EventState[];

  @IsOptional()
  pagination:
    | {
        page: number;
        limit: number;
      }
    | undefined;
}
