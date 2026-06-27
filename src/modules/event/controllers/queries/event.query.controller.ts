import { Controller } from '@nestjs/common';
import { Logger } from '@volontariapp/logger';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { GRPC_SERVICES, EVENT_QUERY_METHODS } from '@volontariapp/contracts-nest';
import type {
  GetUserCreatedEventsQuery,
  GetUserParticipatedEventsQuery,
  GetUserWishedEventsQuery,
} from '@volontariapp/contracts-nest';
import { EventService } from '@volontariapp/domain-event';
import { CurrentUser, InternalToken } from '@volontariapp/auth';
import { SearchEventsQueryDTO } from '../../dto/request/query/search-events.query.dto.js';
import {
  GetEventQueryDTO,
  ListRequirementsQueryDTO,
} from '../../dto/request/query/event.query.dto.js';
import {
  GetEventResponseDTO,
  SearchEventsResponseDTO,
  ListRequirementsResponseDTO,
} from '../../dto/response/event.response.dto.js';
import { GetEventsByIdsQueryDTO } from '../../dto/request/query/get-events-by-ids.query.dto.js';
import { GetEventsByIdsResponseDTO } from '../../dto/response/get-events-by-ids.response.dto.js';
import { EventTransformer, RequirementTransformer } from '../../transformers/index.js';
import type { EventEntity } from '@volontariapp/domain-event';
import type { AuthUser } from '@volontariapp/auth';
import { SocialParticipationQueryClientService } from '../../clients/social-participation.query-client.js';

@Controller()
export class EventQueryController {
  private readonly logger = new Logger({ context: EventQueryController.name });

  constructor(
    private readonly eventService: EventService,
    private readonly eventTransformer: EventTransformer,
    private readonly requirementTransformer: RequirementTransformer,
    private readonly socialParticipationClient: SocialParticipationQueryClientService,
  ) {}

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, EVENT_QUERY_METHODS.GET_EVENT)
  async getEvent(
    @Payload() data: GetEventQueryDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<GetEventResponseDTO> {
    this.logger.log(`gRPC: Fetching event with id: ${data.id}, user: ${user.id}`);
    const entity = await this.eventService.findById(data.id);
    return { event: this.eventTransformer.toEventDTO(entity) };
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, 'GetEventsByIds')
  async getEventsByIds(
    @Payload() data: GetEventsByIdsQueryDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<GetEventsByIdsResponseDTO> {
    this.logger.log(`gRPC: Fetching events by ids: ${String(data.ids.length)}, user: ${user.id}`);
    const eventsEntities = await Promise.all(
      data.ids.map((id) => this.eventService.findById(id).catch(() => null)),
    );
    const validEvents = eventsEntities.filter((e): e is EventEntity => e !== null);
    const events = validEvents.map((e) => this.eventTransformer.toEventDTO(e));
    return { events, totalCount: events.length };
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, EVENT_QUERY_METHODS.SEARCH_EVENTS)
  async searchEvents(
    @Payload() data: SearchEventsQueryDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<SearchEventsResponseDTO> {
    this.logger.log(`gRPC: Searching events with term: ${data.searchTerm}, user: ${user.id}`);
    const entities = !data.searchTerm
      ? await this.eventService.findAll()
      : await this.eventService.search(data.searchTerm);
    const events = entities.map((e) => this.eventTransformer.toEventDTO(e));
    return { events, totalCount: events.length };
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, EVENT_QUERY_METHODS.LIST_REQUIREMENTS)
  async listRequirements(
    @Payload() data: ListRequirementsQueryDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<ListRequirementsResponseDTO> {
    this.logger.log(
      `gRPC: Listing requirements for event with id: ${data.eventId}, user: ${user.id}`,
    );
    const event = await this.eventService.findById(data.eventId);
    const requirements = (event.requirements ?? []).map((r) =>
      this.requirementTransformer.toDto(r),
    );
    return { requirements };
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, 'GetUserCreatedEvents')
  async getUserCreatedEvents(
    @Payload() data: GetUserCreatedEventsQuery,
    @CurrentUser() user: AuthUser,
    @InternalToken() token: string,
  ): Promise<GetEventsByIdsResponseDTO> {
    this.logger.log(`gRPC: Fetching created events for user: ${user.id}`);
    const page = data.pagination?.page ?? 1;
    const limit = data.pagination?.limit ?? 10;

    const { ids, totalCount } = await this.socialParticipationClient.getUserCreatedEvents(
      token,
      limit,
      page,
    );

    const eventsEntities = await Promise.all(
      ids.map((id) => this.eventService.findById(id).catch(() => null)),
    );
    const validEvents = eventsEntities.filter((e): e is EventEntity => e !== null);
    const events = validEvents.map((e) => this.eventTransformer.toEventDTO(e));
    return { events, totalCount };
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, 'GetUserParticipatedEvents')
  async getUserParticipatedEvents(
    @Payload() data: GetUserParticipatedEventsQuery,
    @CurrentUser() user: AuthUser,
    @InternalToken() token: string,
  ): Promise<GetEventsByIdsResponseDTO> {
    this.logger.log(`gRPC: Fetching participated events for user: ${user.id}`);
    const page = data.pagination?.page ?? 1;
    const limit = data.pagination?.limit ?? 10;

    const { ids, totalCount } = await this.socialParticipationClient.getUserParticipatedEvents(
      token,
      limit,
      page,
    );

    const eventsEntities = await Promise.all(
      ids.map((id) => this.eventService.findById(id).catch(() => null)),
    );
    const validEvents = eventsEntities.filter((e): e is EventEntity => e !== null);
    const events = validEvents.map((e) => this.eventTransformer.toEventDTO(e));
    return { events, totalCount };
  }

  @GrpcMethod(GRPC_SERVICES.EVENT_QUERY_SERVICE, 'GetUserWishedEvents')
  async getUserWishedEvents(
    @Payload() data: GetUserWishedEventsQuery,
    @CurrentUser() user: AuthUser,
    @InternalToken() token: string,
  ): Promise<GetEventsByIdsResponseDTO> {
    this.logger.log(`gRPC: Fetching wished events for user: ${user.id}`);
    const page = data.pagination?.page ?? 1;
    const limit = data.pagination?.limit ?? 10;

    const { ids, totalCount } = await this.socialParticipationClient.getUserWishedEvents(
      token,
      limit,
      page,
    );

    const eventsEntities = await Promise.all(
      ids.map((id) => this.eventService.findById(id).catch(() => null)),
    );
    const validEvents = eventsEntities.filter((e): e is EventEntity => e !== null);
    const events = validEvents.map((e) => this.eventTransformer.toEventDTO(e));
    return { events, totalCount };
  }
}
