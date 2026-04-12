import type {
  ManageRequirementCommand,
  AddRequirement,
  RemoveRequirement,
} from '@volontariapp/contracts-nest';

export class ManageRequirementCommandDTO implements ManageRequirementCommand {
  eventId!: string;
  add?: AddRequirement | undefined;
  remove?: RemoveRequirement | undefined;
}
