import { IsEnum, IsUUID } from 'class-validator';
import {
  ChangeEventStateCommand,
  EventState,
} from '@volontariapp/contracts-nest';

export class ChangeEventStateCommandDTO implements ChangeEventStateCommand {
  @IsUUID()
  id!: string;

  @IsEnum(EventState)
  newState!: EventState;
}
