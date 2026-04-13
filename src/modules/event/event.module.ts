import { Module } from '@nestjs/common';
import {
  EventService,
  TagService,
  RequirementService,
  PostgresEventRepository,
  PostgresTagRepository,
  PostgresRequirementRepository,
} from '@volontariapp/domain-event';
import { EventCommandController } from './controllers/event.command.controller.js';
import { EventQueryController } from './controllers/event.query.controller.js';
import { TagCommandController } from './controllers/tag.command.controller.js';
import { TagQueryController } from './controllers/tag.query.controller.js';
import {
  TagTransformer,
  RequirementTransformer,
  EventTransformer,
} from './transformers/index.js';

@Module({
  controllers: [
    EventCommandController,
    EventQueryController,
    TagCommandController,
    TagQueryController,
  ],
  providers: [
    // Repositories
    PostgresEventRepository,
    PostgresTagRepository,
    PostgresRequirementRepository,
    // Domain services
    EventService,
    TagService,
    RequirementService,
    // Transformers
    TagTransformer,
    RequirementTransformer,
    EventTransformer,
  ],
  exports: [EventService, TagService, RequirementService],
})
export class EventModule {}
