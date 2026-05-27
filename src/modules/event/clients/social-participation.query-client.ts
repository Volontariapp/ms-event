import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { SOCIAL_PACKAGE } from '../../../grpc/grpc-packages.js';
import {
  PARTICIPATION_QUERY_SERVICE_NAME,
  ParticipationQueryServiceClient,
  GetUserParticipateEventQuery,
  GetUserParticipateEventResponse,
  GetUserEventQuery,
  GetUserEventResponse,
  GetUserWishEventQuery,
  GetUserWishEventResponse,
} from '@volontariapp/contracts-nest';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { Logger } from '@volontariapp/logger';
import { Observable } from 'rxjs';

interface QueryServiceWithMetadata extends ParticipationQueryServiceClient {
  getUserParticipateEvent(
    request: GetUserParticipateEventQuery,
    metadata?: Metadata,
  ): Observable<GetUserParticipateEventResponse>;
  getUserEvent(request: GetUserEventQuery, metadata?: Metadata): Observable<GetUserEventResponse>;
  getUserWishEvent(
    request: GetUserWishEventQuery,
    metadata?: Metadata,
  ): Observable<GetUserWishEventResponse>;
}

@Injectable()
export class SocialParticipationQueryClientService implements OnModuleInit {
  private readonly logger = new Logger({ context: SocialParticipationQueryClientService.name });
  private queryService!: QueryServiceWithMetadata;

  constructor(@Inject(SOCIAL_PACKAGE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.queryService = this.client.getService<ParticipationQueryServiceClient>(
      PARTICIPATION_QUERY_SERVICE_NAME,
    ) as QueryServiceWithMetadata;
    this.logger.log('SocialParticipationQueryClientService initialized');
  }

  async getUserCreatedEvents(token: string, limit = 10, page = 1): Promise<string[]> {
    this.logger.debug(
      `Calling getUserCreatedEvents with limit=${String(limit)}, page=${String(page)}`,
    );
    const request: GetUserEventQuery = { pagination: { limit, page } };

    const outboundMetadata = new Metadata();
    if (token) {
      outboundMetadata.set('x-internal-token', token);
    }

    const response: GetUserEventResponse = await firstValueFrom(
      this.queryService.getUserEvent(request, outboundMetadata),
    );
    return response.ids;
  }

  async getUserParticipatedEvents(token: string, limit = 10, page = 1): Promise<string[]> {
    this.logger.debug(
      `Calling getUserParticipatedEvents with limit=${String(limit)}, page=${String(page)}`,
    );
    const request: GetUserParticipateEventQuery = { pagination: { limit, page } };

    const outboundMetadata = new Metadata();
    if (token) {
      outboundMetadata.set('x-internal-token', token);
    }

    const response: GetUserParticipateEventResponse = await firstValueFrom(
      this.queryService.getUserParticipateEvent(request, outboundMetadata),
    );
    return response.ids;
  }

  async getUserWishedEvents(token: string, limit = 10, page = 1): Promise<string[]> {
    this.logger.debug(
      `Calling getUserWishedEvents with limit=${String(limit)}, page=${String(page)}`,
    );
    const request: GetUserWishEventQuery = { pagination: { limit, page } };

    const outboundMetadata = new Metadata();
    if (token) {
      outboundMetadata.set('x-internal-token', token);
    }

    const response: GetUserWishEventResponse = await firstValueFrom(
      this.queryService.getUserWishEvent(request, outboundMetadata),
    );
    return response.ids;
  }
}
