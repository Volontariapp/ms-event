import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  EVENT_COMMAND_METHODS,
  CoverStatus,
  ScanStatus,
} from '@volontariapp/contracts-nest';
import { EventService, RequirementService } from '@volontariapp/domain-event';
import { REQUIREMENT_NOT_FOUND } from '@volontariapp/errors-nest';
import { isBaseError } from '@volontariapp/errors';
import { StorageClientService, isGrpcError } from '@volontariapp/storage-client';
import { v5 as uuidv5 } from 'uuid';
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
import { UserRoles } from '@volontariapp/shared';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseCommandController } from './base.command.controller.js';
import { AppConfigService } from '../../../../config/app-config.service.js';

@Controller()
export class EventCommandController extends BaseCommandController {
  constructor(
    private readonly eventService: EventService,
    private readonly requirementService: RequirementService,
    private readonly eventTransformer: EventTransformer,
    private readonly storageClientService: StorageClientService,
    private readonly appConfigService: AppConfigService,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(dataSource);
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_COMMAND_SERVICE, EVENT_COMMAND_METHODS.CREATE_EVENT)
  async createEvent(
    @Payload() data: CreateEventCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<CreateEventResponseDTO> {
    const eventId = uuidv5(
      `${user.id}:${data.idempotencyKey}`,
      this.appConfigService.eventIdNamespace,
    );
    this.logger.log(
      `gRPC: Creating event with id: ${eventId}, title: ${data.title} by organizer: ${user.id}`,
    );

    let coverStatus = CoverStatus.COVER_STATUS_NONE;

    if (data.coverFileId) {
      try {
        const response = await this.storageClientService.confirmEventCoverAttachment(
          eventId,
          data.coverFileId,
        );
        const file = response.files[0];
        if (file.scanStatus === ScanStatus.SCAN_STATUS_CLEAN) {
          coverStatus = CoverStatus.COVER_STATUS_READY;
        } else {
          coverStatus = CoverStatus.COVER_STATUS_PENDING;
        }
      } catch (error: unknown) {
        if (this.isStorageUnavailable(error)) {
          this.logger.warn(
            `ms-storage unavailable for event ${eventId}, falling back asynchronously with cover_status=PENDING: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          coverStatus = CoverStatus.COVER_STATUS_PENDING;
        } else {
          this.logger.error(
            `Failed to confirm file attachment for event ${eventId}`,
            error as Error,
          );
          throw error;
        }
      }
    }

    return this.withFallback(
      JobMessagingType.FALLBACK_CREATE_EVENT,
      user.id,
      data,
      async () => {
        const eventEntity = this.eventTransformer.fromCreateCommand(data, user.id, eventId);
        eventEntity.id = eventId;
        eventEntity.coverStatus = coverStatus;
        if (data.coverFileId) {
          eventEntity.coverFileId = data.coverFileId;
        }
        const createdEntity = await this.eventService.create(eventEntity);
        return { event: this.eventTransformer.toEventDTO(createdEntity) };
      },
      { eventId },
    );
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_COMMAND_SERVICE, EVENT_COMMAND_METHODS.UPDATE_EVENT)
  async updateEvent(
    @Payload() data: UpdateEventCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<UpdateEventResponseDTO> {
    return this.withFallback(JobMessagingType.FALLBACK_UPDATE_EVENT, user.id, data, async () => {
      this.logger.log(`gRPC: Updating event with id: ${data.id}, user: ${user.id}`);
      const partial = this.eventTransformer.fromEventDTO(data.event, data.updateMask);
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
        const entity = await this.eventService.changeState(
          data.id,
          data.newState,
          user.id,
          this.resolveUserRole(user),
        );
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
    const userRole = this.resolveUserRole(user) ?? UserRoles.VOLUNTEER;
    return this.withFallback(
      JobMessagingType.FALLBACK_DELETE_EVENT,
      user.id,
      data,
      async () => {
        this.logger.log(`gRPC: Deleting event with id: ${data.id}, user: ${user.id}`);
        await this.eventService.delete(data.id, user.id, userRole);
        return { success: true };
      },
      { userRole },
    );
  }

  private resolveUserRole(user: AuthUser): UserRoles | undefined {
    return Object.values(UserRoles).find((role) => String(role) === user.role);
  }

  private isStorageUnavailable(error: unknown): boolean {
    if (isBaseError(error)) {
      if (error.code === 'STORAGE_TIMEOUT') return true;
      if (error.code === 'STORAGE_ATTACHMENT_FAILED') {
        const details = error.details as { reason?: string } | undefined;
        const reason = details?.reason?.toUpperCase() ?? '';
        if (
          reason.includes('UNAVAILABLE') ||
          reason.includes('DEADLINE_EXCEEDED') ||
          reason.includes('CONNECT ECONNREFUSED')
        ) {
          return true;
        }
      }
    }
    if (isGrpcError(error)) {
      if (error.code === 14 || error.code === 4) return true;
    }
    return false;
  }
}
