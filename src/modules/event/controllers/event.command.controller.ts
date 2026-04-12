import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
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
  private readonly logger = new Logger({
    context: EventCommandController.name,
  });
  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.CREATE_EVENT,
  )
  createEvent(data: CreateEventCommandDTO): CreateEventResponseDTO {
    this.logger.log(`gRPC: Creating event with title: ${data.title}`);
    return { event: undefined };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.UPDATE_EVENT,
  )
  updateEvent(data: UpdateEventCommandDTO): UpdateEventResponseDTO {
    this.logger.log(`gRPC: Updating event with id: ${data.id}`);
    return { event: undefined };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.CHANGE_EVENT_STATE,
  )
  changeEventState(
    data: ChangeEventStateCommandDTO,
  ): ChangeEventStateResponseDTO {
    this.logger.log(`gRPC: Changing state for event with id: ${data.id}`);
    return { event: undefined };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.MANAGE_REQUIREMENTS,
  )
  manageRequirements(
    data: ManageRequirementCommandDTO,
  ): ManageRequirementsResponseDTO {
    this.logger.log(
      `gRPC: Managing requirements for event with id: ${data.eventId}`,
    );
    return { success: true, message: 'Requirement processed' };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.DELETE_EVENT,
  )
  deleteEvent(data: DeleteEventCommandDTO): DeleteEventResponseDTO {
    this.logger.log(`gRPC: Deleting event with id: ${data.id}`);
    return { success: true };
  }
}
