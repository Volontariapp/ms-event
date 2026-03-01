import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './providers/database/database.module';
import { EventModule } from './modules/event/event.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, EventModule],
})
export class AppModule {}
