import type { Point } from '@volontariapp/contracts-nest';
import { IsNumber } from 'class-validator';

export class PointDTO implements Point {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}
