import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  TAG_COMMAND_METHODS,
} from '@volontariapp/contracts-nest';
import { CreateTagCommandDTO } from '../dto/request/command/create-tag.command.dto.js';
import { UpdateTagCommandDTO } from '../dto/request/command/update-tag.command.dto.js';
import { DeleteTagCommandDTO } from '../dto/request/command/delete-tag.command.dto.js';
import {
  CreateTagResponseDTO,
  UpdateTagResponseDTO,
  DeleteTagResponseDTO,
} from '../dto/response/event.response.dto.js';

@Controller()
export class TagCommandController {
  private readonly logger = new Logger({ context: TagCommandController.name });
  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.CREATE_TAG)
  createTag(data: CreateTagCommandDTO): CreateTagResponseDTO {
    this.logger.log(`gRPC: Creating tag with label: ${data.name}`);
    return { tag: undefined };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.UPDATE_TAG)
  updateTag(data: UpdateTagCommandDTO): UpdateTagResponseDTO {
    this.logger.log(`gRPC: Updating tag with id: ${data.id}`);
    return { tag: undefined };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.DELETE_TAG)
  deleteTag(data: DeleteTagCommandDTO): DeleteTagResponseDTO {
    this.logger.log(`gRPC: Deleting tag with id: ${data.id}`);
    return { success: true };
  }
}
