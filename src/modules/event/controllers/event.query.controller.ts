import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  EVENT_QUERY_METHODS,
} from '@volontariapp/contracts-nest';
import { EventService } from '@volontariapp/domain-event';
import { SearchEventsQueryDTO } from '../dto/request/query/search-events.query.dto.js';
import {
  GetEventQueryDTO,
  ListRequirementsQueryDTO,
} from '../dto/request/query/event.query.dto.js';
import {
  GetEventResponseDTO,
  SearchEventsResponseDTO,
  ListRequirementsResponseDTO,
} from '../dto/response/event.response.dto.js';
import {
  EventTransformer,
  RequirementTransformer,
} from '../transformers/index.js';

@Controller()
export class EventQueryController {
  private readonly logger = new Logger({ context: EventQueryController.name });

  constructor(
    private readonly eventService: EventService,
    private readonly eventTransformer: EventTransformer,
    private readonly requirementTransformer: RequirementTransformer,
  ) {}

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, EVENT_QUERY_METHODS.GET_EVENT)
  async getEvent(data: GetEventQueryDTO): Promise<GetEventResponseDTO> {
    this.logger.log(`gRPC: Fetching event with id: ${data.id}`);
    const entity = await this.eventService.findById(data.id);
    return { event: this.eventTransformer.toEventDTO(entity) };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_QUERY_SERVICE,
    EVENT_QUERY_METHODS.SEARCH_EVENTS,
  )
  async searchEvents(
    data: SearchEventsQueryDTO,
  ): Promise<SearchEventsResponseDTO> {
    this.logger.log(`gRPC: Searching events with term: ${data.searchTerm}`);
    const entities = await this.eventService.search(data.searchTerm);
    const events = entities.map((e) => this.eventTransformer.toEventDTO(e));
    return { events, totalCount: events.length };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_QUERY_SERVICE,
    EVENT_QUERY_METHODS.LIST_REQUIREMENTS,
  )
  async listRequirements(
    data: ListRequirementsQueryDTO,
  ): Promise<ListRequirementsResponseDTO> {
    this.logger.log(
      `gRPC: Listing requirements for event with id: ${data.eventId}`,
    );
    const event = await this.eventService.findById(data.eventId);
    const requirements = (event.requirements ?? []).map((r) =>
      this.requirementTransformer.toDto(r),
    );
    return { requirements };
  }
}
