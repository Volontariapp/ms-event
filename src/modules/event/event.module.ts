import { Module } from '@nestjs/common';
import { EventController } from './event.controller.js';
import { EventGrpcController } from './event.grpc.controller.js';

@Module({
  controllers: [EventController, EventGrpcController],
})
export class EventModule {}
