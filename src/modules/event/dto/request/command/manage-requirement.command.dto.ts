import type { ManageRequirementCommand } from '@volontariapp/contracts-nest';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { AddRequirementDTO } from '../../common/requirement/add-requirement.dto.js';
import { RemoveRequirementDTO } from '../../common/requirement/remove-requirement.dto.js';

export class ManageRequirementCommandDTO implements ManageRequirementCommand {
  @IsUUID()
  eventId!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddRequirementDTO)
  add?: AddRequirementDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => RemoveRequirementDTO)
  remove?: RemoveRequirementDTO;
}
