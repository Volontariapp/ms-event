import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_SERVICES, TAG_QUERY_METHODS } from '@volontariapp/contracts-nest';
import { TagService } from '@volontariapp/domain-event';
import { GetTagsQueryDTO } from '../dto/request/query/event.query.dto.js';
import { GetTagsResponseDTO } from '../dto/response/event.response.dto.js';
import { TagTransformer } from '../transformers/index.js';

@Controller()
export class TagQueryController {
  private readonly logger = new Logger({ context: TagQueryController.name });

  constructor(
    private readonly tagService: TagService,
    private readonly tagTransformer: TagTransformer,
  ) {}

  @GrpcMethod(GRPC_SERVICES.TAG_QUERY_SERVICE, TAG_QUERY_METHODS.GET_TAGS)
  async getTags(data: GetTagsQueryDTO): Promise<GetTagsResponseDTO> {
    this.logger.log('gRPC: Fetching tags');
    const entities =
      data.slugs.length > 0
        ? await Promise.all(
            data.slugs.map((slug) => this.tagService.findBySlug(slug)),
          )
        : await this.tagService.findAll();
    return { tags: entities.map((e) => this.tagTransformer.toDto(e)) };
  }
}
