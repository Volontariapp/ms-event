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
import {
  SearchEventsQuery,
  EventType,
  GeoCircle,
} from '@volontariapp/contracts-nest';
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
}
