import { DynamicModule, Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module.js';
import type { CustomConfig } from './config/base-config.js';
import { DatabaseModule } from './providers/database/database.module.js';
import { EventModule } from './modules/event/event.module.js';
import { HealthModule } from '@volontariapp/health-check-nest';
import { TerminusModule } from '@nestjs/terminus';
import { GrpcClientModule } from './grpc/grpc-client.module.js';

@Module({
  imports: [DatabaseModule, EventModule, GrpcClientModule],
})
export class AppModule {
  static register(config: CustomConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        AppConfigModule.forRoot(config),
        DatabaseModule.forRoot(config.db),
        TerminusModule.forRoot({}),
        HealthModule.register({
          databases: ['postgres'],
          failOnMissingProvider: true,
        }),
        EventModule,
        GrpcClientModule,
      ],
    };
  }
}
