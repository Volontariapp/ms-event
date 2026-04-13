import type { Requirement } from '@volontariapp/contracts-nest';
import { IsNumber, IsString, IsUUID } from 'class-validator';
export class RequirementDto implements Requirement {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;
  @IsString()
  description!: string;
  @IsNumber()
  neededQuantity!: number;
  @IsNumber()
  currentQuantity!: number;
}
