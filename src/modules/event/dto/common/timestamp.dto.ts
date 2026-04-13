import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TimestampDTO {
  @IsNumber()
  @Type(() => Number)
  seconds!: number;

  @IsNumber()
  @Type(() => Number)
  nanos!: number;
}
