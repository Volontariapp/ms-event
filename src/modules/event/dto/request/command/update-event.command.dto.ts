import { UpdateEventCommand, type Event } from '@volontariapp/contracts-nest';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { UpdateEventDataDTO } from '../../common/event/update-event-data.dto.js';

export class UpdateEventCommandDTO implements Omit<
  UpdateEventCommand,
  'event'
> {
  @IsUUID()
  id!: string;

  @IsArray()
  @IsString({ each: true })
  updateMask!: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEventDataDTO)
  event!: Event;
}
