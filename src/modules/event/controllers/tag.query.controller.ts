import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_SERVICES, TAG_QUERY_METHODS } from '@volontariapp/contracts-nest';
import { GetTagsQueryDTO } from '../dto/request/query/event.query.dto.js';
import { GetTagsResponseDTO } from '../dto/response/event.response.dto.js';

@Controller()
export class TagQueryController {
  private readonly logger = new Logger({ context: TagQueryController.name });
  @GrpcMethod(GRPC_SERVICES.TAG_QUERY_SERVICE, TAG_QUERY_METHODS.GET_TAGS)
  getTags(_data: GetTagsQueryDTO): GetTagsResponseDTO {
    this.logger.log('gRPC: Fetching tags');
    return { tags: [] };
  }
}
