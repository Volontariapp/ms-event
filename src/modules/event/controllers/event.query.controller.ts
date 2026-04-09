import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  EVENT_SERVICE_NAME,
  EVENT_GRPC_METHODS,
  type EventQuery,
  type GetEventResponse,
  type ListEventsQuery,
  type ListEventsResponse,
} from '@volontariapp/contracts';

@Controller()
export class EventQueryController {
  @GrpcMethod(EVENT_SERVICE_NAME, EVENT_GRPC_METHODS.GET_EVENT)
  getEvent(_query: EventQuery): Promise<GetEventResponse> {
    throw new Error('Method not implemented.');
  }

  @GrpcMethod(EVENT_SERVICE_NAME, EVENT_GRPC_METHODS.LIST_EVENTS)
  listEvents(_query: ListEventsQuery): Promise<ListEventsResponse> {
    throw new Error('Method not implemented.');
  }
}
