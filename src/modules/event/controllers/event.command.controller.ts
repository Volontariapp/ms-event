import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  EVENT_COMMAND_METHODS,
} from '@volontariapp/contracts-nest';
import { CreateEventCommandDTO } from '../dto/request/command/create-event.command.dto.js';
import { UpdateEventCommandDTO } from '../dto/request/command/update-event.command.dto.js';
import { ChangeEventStateCommandDTO } from '../dto/request/command/change-event-state.command.dto.js';
import { ManageRequirementCommandDTO } from '../dto/request/command/manage-requirement.command.dto.js';
import { DeleteEventCommandDTO } from '../dto/request/command/delete-event.command.dto.js';
import {
  CreateEventResponseDTO,
  UpdateEventResponseDTO,
  ChangeEventStateResponseDTO,
  ManageRequirementsResponseDTO,
  DeleteEventResponseDTO,
} from '../dto/response/event.response.dto.js';

@Controller()
export class EventCommandController {
  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.CREATE_EVENT,
  )
  createEvent(_data: CreateEventCommandDTO): CreateEventResponseDTO {
    return { event: undefined };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.UPDATE_EVENT,
  )
  updateEvent(_data: UpdateEventCommandDTO): UpdateEventResponseDTO {
    return { event: undefined };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.CHANGE_EVENT_STATE,
  )
  changeEventState(
    _data: ChangeEventStateCommandDTO,
  ): ChangeEventStateResponseDTO {
    return { event: undefined };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.MANAGE_REQUIREMENTS,
  )
  manageRequirements(
    _data: ManageRequirementCommandDTO,
  ): ManageRequirementsResponseDTO {
    return { success: true, message: 'Requirement processed' };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.DELETE_EVENT,
  )
  deleteEvent(_data: DeleteEventCommandDTO): DeleteEventResponseDTO {
    return { success: true };
  }
}
