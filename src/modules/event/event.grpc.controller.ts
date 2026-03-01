import { Controller } from '@nestjs/common';
import {
  EventServiceController,
  EventServiceControllerMethods,
  CreateEventRequest,
  CreateEventResponse,
  GetEventRequest,
  GetEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  DeleteEventRequest,
  DeleteEventResponse,
  ListEventsRequest,
  ListEventsResponse,
} from '@volontariapp/contracts';

@Controller()
@EventServiceControllerMethods()
export class EventGrpcController implements EventServiceController {
  async getEvent(_request: GetEventRequest): Promise<GetEventResponse> {
    throw new Error('Method not implemented.');
  }

  async listEvents(_request: ListEventsRequest): Promise<ListEventsResponse> {
    throw new Error('Method not implemented.');
  }

  async createEvent(
    _request: CreateEventRequest,
  ): Promise<CreateEventResponse> {
    throw new Error('Method not implemented.');
  }

  async updateEvent(
    _request: UpdateEventRequest,
  ): Promise<UpdateEventResponse> {
    throw new Error('Method not implemented.');
  }

  async deleteEvent(
    _request: DeleteEventRequest,
  ): Promise<DeleteEventResponse> {
    throw new Error('Method not implemented.');
  }
}
