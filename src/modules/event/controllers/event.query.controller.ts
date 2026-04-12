import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  EVENT_QUERY_METHODS,
} from '@volontariapp/contracts-nest';
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

@Controller()
export class EventQueryController {
  private readonly logger = new Logger({ context: EventQueryController.name });
  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, EVENT_QUERY_METHODS.GET_EVENT)
  getEvent(data: GetEventQueryDTO): GetEventResponseDTO {
    this.logger.log(`gRPC: Fetching event with id: ${data.id}`);
    return { event: undefined };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_QUERY_SERVICE,
    EVENT_QUERY_METHODS.SEARCH_EVENTS,
  )
  searchEvents(data: SearchEventsQueryDTO): SearchEventsResponseDTO {
    this.logger.log(
      `gRPC: Searching events with filters: ${JSON.stringify(data)}`,
    );
    return { events: [], totalCount: 0 };
  }

  @GrpcMethod(
    GRPC_SERVICES.EVENT_QUERY_SERVICE,
    EVENT_QUERY_METHODS.LIST_REQUIREMENTS,
  )
  listRequirements(
    data: ListRequirementsQueryDTO,
  ): ListRequirementsResponseDTO {
    this.logger.log(
      `gRPC: Listing requirements for event with id: ${data.eventId}`,
    );
    return { requirements: [] };
  }
}
