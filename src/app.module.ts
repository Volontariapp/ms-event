import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module.js';
import { DatabaseModule } from './providers/database/database.module.js';
import { EventModule } from './modules/event/event.module.js';

@Module({
  imports: [AppConfigModule, DatabaseModule, EventModule],
})
export class AppModule {}
