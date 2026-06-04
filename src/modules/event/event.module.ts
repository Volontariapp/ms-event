import { Module } from '@nestjs/common';
import {
  EventService,
  TagService,
  RequirementService,
  PostgresEventRepository,
  PostgresTagRepository,
  PostgresRequirementRepository,
  GeocodingService,
  GoogleMapsStrategy,
  OpenStreetMapStrategy,
} from '@volontariapp/domain-event';
import { AppConfigService } from '../../config/app-config.service.js';
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
    {
      provide: GeocodingService,
      useFactory: (appConfigService: AppConfigService) => {
        const apiKey: string = appConfigService.geocoding.googleMapsApiKey;
        const userAgent: string = appConfigService.geocoding.osmUserAgent;
        const skipInTestEnv: boolean = appConfigService.geocoding.skipInTestEnv;

        const primaryStrategy: OpenStreetMapStrategy = new OpenStreetMapStrategy(
          userAgent,
          skipInTestEnv,
        );
        const fallbackStrategy: GoogleMapsStrategy = new GoogleMapsStrategy(apiKey, skipInTestEnv);

        return new GeocodingService(primaryStrategy, fallbackStrategy);
      },
      inject: [AppConfigService],
    },
  ],
  exports: [
    EventService,
    TagService,
    RequirementService,
    SocialParticipationQueryClientService,
    GeocodingService,
  ],
})
export class EventModule {}
