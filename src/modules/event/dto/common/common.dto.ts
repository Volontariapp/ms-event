import { Tag, Requirement } from '@volontariapp/contracts-nest';
import {
  IsString,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { TagsNames } from '@volontariapp/shared';

export class TagDTO implements Tag {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(TagsNames)
  balise!: string;
}

export class RequirementDTO implements Requirement {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  neededQuantity!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentQuantity!: number;
}
