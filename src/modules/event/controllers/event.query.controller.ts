import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  EVENT_SERVICE_NAME,
  type EventQuery,
  type GetEventResponse,
  type ListEventsQuery,
  type ListEventsResponse,
} from '@volontariapp/contracts';

@Controller()
export class EventQueryController {
  @GrpcMethod(EVENT_SERVICE_NAME, 'getEvent')
  async getEvent(_query: EventQuery): Promise<GetEventResponse> {
    throw new Error('Method not implemented.');
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'listEvents')
  async listEvents(_query: ListEventsQuery): Promise<ListEventsResponse> {
    throw new Error('Method not implemented.');
  }
}
