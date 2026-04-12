import { Controller } from '@nestjs/common';
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
  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.CREATE_TAG)
  createTag(_data: CreateTagCommandDTO): CreateTagResponseDTO {
    return { tag: undefined };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.UPDATE_TAG)
  updateTag(_data: UpdateTagCommandDTO): UpdateTagResponseDTO {
    return { tag: undefined };
  }

  @GrpcMethod(GRPC_SERVICES.TAG_COMMAND_SERVICE, TAG_COMMAND_METHODS.DELETE_TAG)
  deleteTag(_data: DeleteTagCommandDTO): DeleteTagResponseDTO {
    return { success: true };
  }
}
