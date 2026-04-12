import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_SERVICES, TAG_QUERY_METHODS } from '@volontariapp/contracts-nest';
import { GetTagsQueryDTO } from '../dto/request/query/event.query.dto.js';
import { GetTagsResponseDTO } from '../dto/response/event.response.dto.js';

@Controller()
export class TagQueryController {
  @GrpcMethod(GRPC_SERVICES.TAG_QUERY_SERVICE, TAG_QUERY_METHODS.GET_TAGS)
  getTags(_data: GetTagsQueryDTO): GetTagsResponseDTO {
    return { tags: [] };
  }
}
