import { Event, EventState, EventType } from '@volontariapp/contracts-nest';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TimestampDTO } from '../timestamp.dto.js';
import { PointDTO } from '../point.dto.js';
import { RequirementDTO, TagDTO } from '../common.dto.js';

export class UpdateEventDataDTO implements Partial<Event> {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  startAt?: TimestampDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  endAt?: TimestampDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => PointDTO)
  location?: PointDTO;

  @IsOptional()
  @IsString()
  localisationName?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const enumValue = EventType[value as keyof typeof EventType];
      return typeof enumValue === 'number' ? enumValue : value;
    }
    return value;
  })
  @IsEnum(EventType)
  public type?: EventType;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const enumValue = EventState[value as keyof typeof EventState];
      return typeof enumValue === 'number' ? enumValue : value;
    }
    return value;
  })
  @IsEnum(EventState)
  public state?: EventState;

  @IsOptional()
  @IsNumber()
  awardedImpactScore?: number;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @IsOptional()
  @IsNumber()
  currentParticipants?: number;

  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDTO)
  tags?: TagDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequirementDTO)
  requirements?: RequirementDTO[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  createdAt?: TimestampDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  updatedAt?: TimestampDTO;
}
