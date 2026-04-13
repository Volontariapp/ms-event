import { AddRequirement } from '@volontariapp/contracts-nest';
import { IsNumber, IsString } from 'class-validator';

export class AddRequirementDTO implements AddRequirement {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  neededQuantity!: number;
}
