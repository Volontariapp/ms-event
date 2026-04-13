import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  EVENT_COMMAND_METHODS,
} from '@volontariapp/contracts-nest';
import { EventService, RequirementService } from '@volontariapp/domain-event';
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
import { EventTransformer } from '../transformers/index.js';

@Controller()
export class EventCommandController {
  private readonly logger = new Logger({
    context: EventCommandController.name,
  });

  constructor(
    private readonly eventService: EventService,
    private readonly requirementService: RequirementService,
    private readonly eventTransformer: EventTransformer,
  ) {}

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.CREATE_EVENT,
  )
  async createEvent(
    data: CreateEventCommandDTO,
  ): Promise<CreateEventResponseDTO> {
    this.logger.log(`gRPC: Creating event with title: ${data.title}`);
    const entity = await this.eventService.create(
      this.eventTransformer.fromCreateCommand(data),
    );
    return { event: this.eventTransformer.toEventDTO(entity) };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.UPDATE_EVENT,
  )
  async updateEvent(
    data: UpdateEventCommandDTO,
  ): Promise<UpdateEventResponseDTO> {
    this.logger.log(`gRPC: Updating event with id: ${data.id}`);
    const partial = this.eventTransformer.fromEventDTO(data.event);
    this.logger.debug(
      `gRPC: Updating event payload: ${JSON.stringify(partial)}`,
    );
    const entity = await this.eventService.update(data.id, partial);
    return { event: this.eventTransformer.toEventDTO(entity) };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.CHANGE_EVENT_STATE,
  )
  async changeEventState(
    data: ChangeEventStateCommandDTO,
  ): Promise<ChangeEventStateResponseDTO> {
    this.logger.log(`gRPC: Changing state for event with id: ${data.id}`);
    const entity = await this.eventService.changeState(data.id, data.newState);
    return { event: this.eventTransformer.toEventDTO(entity) };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.MANAGE_REQUIREMENTS,
  )
  async manageRequirements(
    data: ManageRequirementCommandDTO,
  ): Promise<ManageRequirementsResponseDTO> {
    this.logger.log(
      `gRPC: Managing requirements for event with id: ${data.eventId}`,
    );

    const event = await this.eventService.findById(data.eventId);

    if (data.add) {
      const newReq = await this.requirementService.create({
        name: data.add.name,
        quantity: data.add.neededQuantity,
        isSystem: false,
      });
      const requirements = [...(event.requirements ?? []), newReq];
      await this.eventService.update(data.eventId, { requirements });
      return { success: true, message: 'Requirement added' };
    }

    if (data.remove) {
      const requirements = (event.requirements ?? []).filter(
        (r) => r.id !== data.remove?.requirementId,
      );
      await this.eventService.update(data.eventId, { requirements });
      return { success: true, message: 'Requirement removed' };
    }

    return { success: false, message: 'No operation specified' };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_COMMAND_SERVICE,
    EVENT_COMMAND_METHODS.DELETE_EVENT,
  )
  async deleteEvent(
    data: DeleteEventCommandDTO,
  ): Promise<DeleteEventResponseDTO> {
    this.logger.log(`gRPC: Deleting event with id: ${data.id}`);
    await this.eventService.delete(data.id);
    return { success: true };
  }
}
