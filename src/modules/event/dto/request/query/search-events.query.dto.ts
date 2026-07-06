import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SearchEventsQuery, EventType, GeoCircle, EventState } from '@volontariapp/contracts-nest';
import { PointDTO } from '../../common/point.dto.js';

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

  @IsUUID(4, { each: true })
  @IsOptional()
  ids!: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  excludedIds!: string[];

  @IsString()
  @IsOptional()
  startDateFrom?: string;

  @IsString()
  @IsOptional()
  startDateTo?: string;

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
