import { Event, EventState, EventType } from '@volontariapp/contracts-nest';
import { Type } from 'class-transformer';
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

export class EventDTO implements Event {
  @IsUUID()
  id!: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  startAt: TimestampDTO | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  endAt: TimestampDTO | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => PointDTO)
  location: PointDTO | undefined;

  @IsString()
  localisationName!: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsEnum(EventState)
  state!: EventState;

  @IsNumber()
  awardedImpactScore!: number;

  @IsNumber()
  maxParticipants!: number;

  @IsNumber()
  currentParticipants!: number;

  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDTO)
  tags!: TagDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequirementDTO)
  requirements!: RequirementDTO[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  createdAt: TimestampDTO | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimestampDTO)
  updatedAt: TimestampDTO | undefined;
}
