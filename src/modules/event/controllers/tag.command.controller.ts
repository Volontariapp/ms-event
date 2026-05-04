import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { GRPC_SERVICES, TAG_COMMAND_METHODS } from '@volontariapp/contracts-nest';
import { TagService } from '@volontariapp/domain-event';
import { CurrentUser } from '@volontariapp/auth';
import { CreateTagCommandDTO } from '../dto/request/command/create-tag.command.dto.js';
import { UpdateTagCommandDTO } from '../dto/request/command/update-tag.command.dto.js';
import { DeleteTagCommandDTO } from '../dto/request/command/delete-tag.command.dto.js';
import {
  CreateTagResponseDTO,
  UpdateTagResponseDTO,
  DeleteTagResponseDTO,
} from '../dto/response/event.response.dto.js';
import { TagTransformer } from '../transformers/index.js';
import type { AuthUser } from '@volontariapp/auth';

@Controller()
export class TagCommandController {
  private readonly logger = new Logger({ context: TagCommandController.name });

  constructor(
    private readonly tagService: TagService,
    private readonly tagTransformer: TagTransformer,
  ) {}

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.CREATE_TAG)
  async createTag(
    @Payload() data: CreateTagCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<CreateTagResponseDTO> {
    this.logger.log(`gRPC: Creating tag with label: ${data.name}, user: ${user.id}`);
    const entity = await this.tagService.create(this.tagTransformer.toEntity(data));
    return { tag: this.tagTransformer.toDto(entity) };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.UPDATE_TAG)
  async updateTag(
    @Payload() data: UpdateTagCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<UpdateTagResponseDTO> {
    this.logger.log(`gRPC: Updating tag with id: ${data.id}, user: ${user.id}`);
    const entity = await this.tagService.update(data.id, {
      name: data.name,
      balise: data.balise,
    });
    return { tag: this.tagTransformer.toDto(entity) };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.DELETE_TAG)
  async deleteTag(
    @Payload() data: DeleteTagCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<DeleteTagResponseDTO> {
    this.logger.log(`gRPC: Deleting tag with id: ${data.id}, user: ${user.id}`);
    await this.tagService.delete(data.id);
    return { success: true };
  }
}
