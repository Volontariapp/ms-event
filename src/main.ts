import './tracing.js';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { GRPC_SERVICES, getGrpcOptions } from '@volontariapp/contracts';
import { AppModule } from './app.module.js';
import { AppConfigService } from './config/app-config.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  app.connectMicroservice(
    getGrpcOptions(GRPC_SERVICES.EVENT, configService.msEventUrl),
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
