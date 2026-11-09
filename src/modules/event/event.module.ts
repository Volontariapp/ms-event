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
import { NodeEnv } from '@volontariapp/config';
import { AppConfigService } from '../../config/app-config.service.js';
import { EventCommandController } from './controllers/commands/event.command.controller.js';
import { EventQueryController } from './controllers/queries/event.query.controller.js';
import { TagCommandController } from './controllers/commands/tag.command.controller.js';
import { TagQueryController } from './controllers/queries/tag.query.controller.js';
import { TagTransformer, RequirementTransformer, EventTransformer } from './transformers/index.js';
import { SocialParticipationQueryClientService } from './clients/social-participation.query-client.js';
import { EventSearchTotalCache } from './providers/event-search-total-cache.provider.js';
import { CacheStatsModule } from '../../common/cache/cache-stats.module.js';
import { CacheStatsReporter } from '../../common/cache/cache-stats.reporter.js';
import { StorageClientModule } from '@volontariapp/storage-client';
import {
  StorageClientConfigModule,
  StorageClientConfigService,
} from './storage-client-config.module.js';

@Module({
  imports: [
    CacheStatsModule,
    StorageClientModule.registerAsync({
      imports: [StorageClientConfigModule],
      useExisting: StorageClientConfigService,
    }),
  ],
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
      provide: EventSearchTotalCache,
      inject: [CacheStatsReporter],
      useFactory: (reporter: CacheStatsReporter): EventSearchTotalCache => {
        const cache = new EventSearchTotalCache();
        reporter.register(cache);
        return cache;
      },
    },
    {
      provide: GeocodingService,
      useFactory: (appConfigService: AppConfigService) => {
        const apiKey: string = appConfigService.geocoding.googleMapsApiKey;
        const userAgent: string = appConfigService.geocoding.osmUserAgent;
        const skipInTestEnv: boolean = appConfigService.config.nodeEnv === NodeEnv.TEST;

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
