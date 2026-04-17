import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEventCommand, EventType } from '@volontariapp/contracts-nest';
import { TimestampDTO } from '../../common/timestamp.dto.js';

export class CreateEventCommandDTO implements CreateEventCommand {
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

  @IsString()
  localisationName!: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsNumber()
  @Min(0)
  awardedImpactScore!: number;

  @IsNumber()
  @Min(1)
  maxParticipants!: number;

  @IsArray()
  @IsUUID('all', { each: true })
  tagIds!: string[];
}
