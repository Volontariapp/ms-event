import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  TAG_COMMAND_METHODS,
} from '@volontariapp/contracts-nest';
import { TagService } from '@volontariapp/domain-event';
import { CreateTagCommandDTO } from '../dto/request/command/create-tag.command.dto.js';
import { UpdateTagCommandDTO } from '../dto/request/command/update-tag.command.dto.js';
import { DeleteTagCommandDTO } from '../dto/request/command/delete-tag.command.dto.js';
import {
  CreateTagResponseDTO,
  UpdateTagResponseDTO,
  DeleteTagResponseDTO,
} from '../dto/response/event.response.dto.js';
import { TagTransformer } from '../transformers/index.js';

@Controller()
export class TagCommandController {
  private readonly logger = new Logger({ context: TagCommandController.name });

  constructor(
    private readonly tagService: TagService,
    private readonly tagTransformer: TagTransformer,
  ) {}

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.CREATE_TAG)
  async createTag(data: CreateTagCommandDTO): Promise<CreateTagResponseDTO> {
    this.logger.log(`gRPC: Creating tag with label: ${data.name}`);
    const entity = await this.tagService.create(
      this.tagTransformer.toEntity(data),
    );
    return { tag: this.tagTransformer.toDto(entity) };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.UPDATE_TAG)
  async updateTag(data: UpdateTagCommandDTO): Promise<UpdateTagResponseDTO> {
    this.logger.log(`gRPC: Updating tag with id: ${data.id}`);
    const entity = await this.tagService.update(data.id, {
      name: data.name,
      color: data.color,
    });
    return { tag: this.tagTransformer.toDto(entity) };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.DELETE_TAG)
  async deleteTag(data: DeleteTagCommandDTO): Promise<DeleteTagResponseDTO> {
    this.logger.log(`gRPC: Deleting tag with id: ${data.id}`);
    await this.tagService.delete(data.id);
    return { success: true };
  }
}
