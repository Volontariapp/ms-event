import { Module } from '@nestjs/common';
import {
  EventService,
  TagService,
  RequirementService,
  PostgresEventRepository,
  PostgresTagRepository,
  PostgresRequirementRepository,
} from '@volontariapp/domain-event';
import { EventCommandController } from './controllers/commands/event.command.controller.js';
import { EventQueryController } from './controllers/queries/event.query.controller.js';
import { TagCommandController } from './controllers/commands/tag.command.controller.js';
import { TagQueryController } from './controllers/queries/tag.query.controller.js';
import { TagTransformer, RequirementTransformer, EventTransformer } from './transformers/index.js';
import { SocialParticipationQueryClientService } from './clients/social-participation.query-client.js';

@Module({
  controllers: [
    EventCommandController,
    EventQueryController,
    TagCommandController,
    TagQueryController,
  ],
  providers: [
    PostgresEventRepository,
    PostgresTagRepository,
    PostgresRequirementRepository,
    EventService,
    TagService,
    RequirementService,
    TagTransformer,
    RequirementTransformer,
    EventTransformer,
    SocialParticipationQueryClientService,
  ],
  exports: [EventService, TagService, RequirementService, SocialParticipationQueryClientService],
})
export class EventModule {}
