import { RemoveRequirement } from '@volontariapp/contracts-nest';
import { IsUUID } from 'class-validator';

export class RemoveRequirementDTO implements RemoveRequirement {
  @IsUUID()
  requirementId!: string;
}
