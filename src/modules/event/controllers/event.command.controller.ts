import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  EVENT_SERVICE_NAME,
  EVENT_GRPC_METHODS,
  type CreateEventCommand,
  type CreateEventResponse,
  type UpdateEventCommand,
  type UpdateEventResponse,
  type DeleteEventCommand,
  type DeleteEventResponse,
} from '@volontariapp/contracts';

@Controller()
export class EventCommandController {
  @GrpcMethod(EVENT_SERVICE_NAME, EVENT_GRPC_METHODS.CREATE_EVENT)
  async createEvent(
    _command: CreateEventCommand,
  ): Promise<CreateEventResponse> {
    throw new Error('Method not implemented.');
  }

  @GrpcMethod(EVENT_SERVICE_NAME, EVENT_GRPC_METHODS.UPDATE_EVENT)
  async updateEvent(
    _command: UpdateEventCommand,
  ): Promise<UpdateEventResponse> {
    throw new Error('Method not implemented.');
  }

  @GrpcMethod(EVENT_SERVICE_NAME, EVENT_GRPC_METHODS.DELETE_EVENT)
  async deleteEvent(
    _command: DeleteEventCommand,
  ): Promise<DeleteEventResponse> {
    throw new Error('Method not implemented.');
  }
}
