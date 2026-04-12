import { Tag, Requirement } from '@volontariapp/contracts-nest';
import { IsString, IsInt, Min, IsUUID } from 'class-validator';

export class TagDTO implements Tag {
  @IsUUID()
  id!: string;

  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  color!: string;
}

export class RequirementDTO implements Requirement {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(0)
  neededQuantity!: number;

  @IsInt()
  @Min(0)
  currentQuantity!: number;
}
