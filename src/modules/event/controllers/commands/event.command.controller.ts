import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { GRPC_SERVICES, EVENT_COMMAND_METHODS } from '@volontariapp/contracts-nest';
import { EventService, RequirementService } from '@volontariapp/domain-event';
import { REQUIREMENT_NOT_FOUND } from '@volontariapp/errors-nest';
import type { AuthUser } from '@volontariapp/auth';
import { CurrentUser } from '@volontariapp/auth';
import { CreateEventCommandDTO } from '../../dto/request/command/create-event.command.dto.js';
import { UpdateEventCommandDTO } from '../../dto/request/command/update-event.command.dto.js';
import { ChangeEventStateCommandDTO } from '../../dto/request/command/change-event-state.command.dto.js';
import { ManageRequirementCommandDTO } from '../../dto/request/command/manage-requirement.command.dto.js';
import { DeleteEventCommandDTO } from '../../dto/request/command/delete-event.command.dto.js';
import {
  CreateEventResponseDTO,
  UpdateEventResponseDTO,
  ChangeEventStateResponseDTO,
  ManageRequirementsResponseDTO,
  DeleteEventResponseDTO,
} from '../../dto/response/event.response.dto.js';
import { EventTransformer } from '../../transformers/index.js';
import { JobMessagingType } from '@volontariapp/messaging';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseCommandController } from './base.command.controller.js';

@Controller()
export class EventCommandController extends BaseCommandController {
  constructor(
    private readonly eventService: EventService,
    private readonly requirementService: RequirementService,
    private readonly eventTransformer: EventTransformer,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(dataSource);
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_COMMAND_SERVICE, EVENT_COMMAND_METHODS.CREATE_EVENT)
  async createEvent(
    @Payload() data: CreateEventCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<CreateEventResponseDTO> {
    return this.withFallback(JobMessagingType.FALLBACK_CREATE_EVENT, user.id, data, async () => {
      this.logger.log(`gRPC: Creating event with title: ${data.title}, organizer: ${user.id}`);
      const entity = await this.eventService.create(
        this.eventTransformer.fromCreateCommand(data, user.id),
      );
      return { event: this.eventTransformer.toEventDTO(entity) };
    });
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_COMMAND_SERVICE, EVENT_COMMAND_METHODS.UPDATE_EVENT)
  async updateEvent(
    @Payload() data: UpdateEventCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<UpdateEventResponseDTO> {
    return this.withFallback(JobMessagingType.FALLBACK_UPDATE_EVENT, user.id, data, async () => {
      this.logger.log(`gRPC: Updating event with id: ${data.id}, user: ${user.id}`);
      const partial = this.eventTransformer.fromEventDTO(data.event);
      this.logger.debug(`gRPC: Updating event payload: ${JSON.stringify(partial)}`);
      const entity = await this.eventService.update(data.id, partial);
      return { event: this.eventTransformer.toEventDTO(entity) };
    });
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_COMMAND_SERVICE, EVENT_COMMAND_METHODS.CHANGE_EVENT_STATE)
  async changeEventState(
    @Payload() data: ChangeEventStateCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<ChangeEventStateResponseDTO> {
    return this.withFallback(
      JobMessagingType.FALLBACK_CHANGE_EVENT_STATE,
      user.id,
      data,
      async () => {
        this.logger.log(`gRPC: Changing state for event with id: ${data.id}, user: ${user.id}`);
        const entity = await this.eventService.changeState(data.id, data.newState);
        return { event: this.eventTransformer.toEventDTO(entity) };
      },
    );
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_COMMAND_SERVICE, EVENT_COMMAND_METHODS.MANAGE_REQUIREMENTS)
  async manageRequirements(
    @Payload() data: ManageRequirementCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<ManageRequirementsResponseDTO> {
    return this.withFallback(
      JobMessagingType.FALLBACK_MANAGE_REQUIREMENTS,
      user.id,
      data,
      async () => {
        this.logger.log(
          `gRPC: Managing requirements for event with id: ${data.eventId}, user: ${user.id}`,
        );

        const event = await this.eventService.findById(data.eventId);
        this.logger.debug(`gRPC: Event found: ${JSON.stringify(event)}`);

        if (data.add) {
          const newReq = await this.requirementService.create({
            name: data.add.name,
            quantity: data.add.neededQuantity,
            isSystem: false,
            createdBy: event.organizerId,
          });
          const requirements = [...(event.requirements ?? []), newReq];
          this.logger.debug(`gRPC: Requirements updated: ${JSON.stringify(requirements)}`);
          const updatedEvent = await this.eventService.update(data.eventId, {
            requirements,
          });
          this.logger.debug(`gRPC: Event updated: ${JSON.stringify(updatedEvent.requirements)}`);
          return { success: true, message: 'Requirement added' };
        }

        if (data.remove) {
          const requirementId = data.remove.requirementId;
          const exists = (event.requirements ?? []).some((r) => r.id === requirementId);

          if (!exists) {
            throw REQUIREMENT_NOT_FOUND(requirementId);
          }

          const requirements = (event.requirements ?? []).filter((r) => r.id !== requirementId);
          await this.eventService.update(data.eventId, { requirements }); // Note: event updates do not have updatedBy yet, but requirements don't have a separate update endpoint here.
          return { success: true, message: 'Requirement removed' };
        }

        return { success: false, message: 'No operation specified' };
      },
    );
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_COMMAND_SERVICE, EVENT_COMMAND_METHODS.DELETE_EVENT)
  async deleteEvent(
    @Payload() data: DeleteEventCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<DeleteEventResponseDTO> {
    return this.withFallback(JobMessagingType.FALLBACK_DELETE_EVENT, user.id, data, async () => {
      this.logger.log(`gRPC: Deleting event with id: ${data.id}, user: ${user.id}`);
      await this.eventService.delete(data.id);
      return { success: true };
    });
  }
}
