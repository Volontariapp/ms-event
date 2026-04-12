import type {
  ChangeEventStateCommand,
  EventState,
} from '@volontariapp/contracts-nest';

export class ChangeEventStateCommandDTO implements ChangeEventStateCommand {
  id!: string;
  newState!: EventState;
}
