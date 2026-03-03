import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  EVENT_SERVICE_NAME,
  type CreateEventCommand,
  type CreateEventResponse,
  type UpdateEventCommand,
  type UpdateEventResponse,
  type DeleteEventCommand,
  type DeleteEventResponse,
} from '@volontariapp/contracts';

@Controller()
export class EventCommandController {
  @GrpcMethod(EVENT_SERVICE_NAME, 'createEvent')
  async createEvent(
    _command: CreateEventCommand,
  ): Promise<CreateEventResponse> {
    throw new Error('Method not implemented.');
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'updateEvent')
  async updateEvent(
    _command: UpdateEventCommand,
  ): Promise<UpdateEventResponse> {
    throw new Error('Method not implemented.');
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'deleteEvent')
  async deleteEvent(
    _command: DeleteEventCommand,
  ): Promise<DeleteEventResponse> {
    throw new Error('Method not implemented.');
  }
}
