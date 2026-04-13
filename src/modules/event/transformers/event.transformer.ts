import { Injectable } from '@nestjs/common';
import {
  EventEntity,
  EventLocation,
  TagEntity,
} from '@volontariapp/domain-event';
import type { Event } from '@volontariapp/contracts-nest';
import { EventDTO } from '../dto/common/event.dto.js';
import { PointDTO } from '../dto/common/point.dto.js';
import { CreateEventCommandDTO } from '../dto/request/command/create-event.command.dto.js';
import { TagTransformer } from './tag.transformer.js';
import { RequirementTransformer } from './requirement.transformer.js';
import { Logger } from '@volontariapp/logger';
import { GrpcDateMapper } from '@volontariapp/contracts-nest';

@Injectable()
export class EventTransformer {
  private readonly logger = new Logger({ context: EventTransformer.name });

  constructor(
    private readonly tagTransformer: TagTransformer,
    private readonly requirementTransformer: RequirementTransformer,
  ) {}

  /**
   * CreateEventCommandDTO → EventEntity
   */
  fromCreateCommand(dto: CreateEventCommandDTO): Partial<EventEntity> {
    const entity = new EventEntity();

    this.logger.debug(`Mapping CreateEventCommandDTO: ${JSON.stringify(dto)}`);

    entity.name = dto.title;
    entity.description = dto.description;
    entity.startAt = GrpcDateMapper.toDate(dto.startAt);
    entity.endAt = GrpcDateMapper.toDate(dto.endAt);

    if (dto.location) {
      entity.location = new EventLocation(
        dto.location.latitude,
        dto.location.longitude,
      );
    }

    entity.type = dto.type;
    entity.awardedImpactScore = dto.awardedImpactScore ?? 0;
    entity.maxParticipants = dto.maxParticipants ?? 0;

    if (dto.tagIds && dto.tagIds.length > 0) {
      entity.tags = dto.tagIds.map((id: string) => {
        const t = new TagEntity();
        t.id = id;
        return t;
      });
    }

    return entity;
  }

  /**
   * UpdateEventCommand → Partial<EventEntity>
   */
  fromEventDTO(dto: Partial<Event>): Partial<EventEntity> {
    const entity = new EventEntity();

    if (dto.id && dto.id !== '') entity.id = dto.id;
    if (dto.title !== undefined) entity.name = dto.title;
    if (dto.description !== undefined) entity.description = dto.description;

    if (dto.startAt !== undefined) {
      entity.startAt = GrpcDateMapper.toDate(dto.startAt);
    }

    if (dto.endAt !== undefined) {
      entity.endAt = GrpcDateMapper.toDate(dto.endAt);
    }

    if (dto.location) {
      entity.location = new EventLocation(
        dto.location.latitude,
        dto.location.longitude,
      );
    }

    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.state !== undefined) entity.state = dto.state;
    if (dto.awardedImpactScore !== undefined) {
      entity.awardedImpactScore = dto.awardedImpactScore;
    }
    if (dto.maxParticipants !== undefined) {
      entity.maxParticipants = dto.maxParticipants;
    }

    if (dto.tags)
      entity.tags = dto.tags.map((t) => this.tagTransformer.toEntity(t));

    return entity;
  }

  /**
   * EventEntity → EventDTO
   * Used for all response shapes (GetEvent, CreateEvent, UpdateEvent, SearchEvents…)
   */
  toEventDTO(entity: EventEntity): EventDTO {
    const dto = new EventDTO();
    dto.id = entity.id;
    dto.title = entity.name;
    dto.description = entity.description;
    dto.startAt = GrpcDateMapper.toTimestamp(entity.startAt)!;
    dto.endAt = GrpcDateMapper.toTimestamp(entity.endAt)!;

    const point = new PointDTO();
    point.latitude = entity.location.latitude;
    point.longitude = entity.location.longitude;
    dto.location = point;

    dto.type = entity.type;
    dto.state = entity.state;
    dto.awardedImpactScore = entity.awardedImpactScore;
    dto.maxParticipants = entity.maxParticipants;
    dto.tags = entity.tags
      ? entity.tags.map((t) => this.tagTransformer.toDto(t))
      : [];
    dto.requirements = entity.requirements
      ? entity.requirements.map((r) => this.requirementTransformer.toDto(r))
      : [];

    // Fields not stored in the domain entity — zero-valued for now
    dto.currentParticipants = 0;
    dto.localisationName = '';
    dto.organizerId = '';
    dto.createdAt = GrpcDateMapper.toTimestamp(entity.createdAt || new Date())!;
    dto.updatedAt = GrpcDateMapper.toTimestamp(entity.updatedAt || new Date())!;
    return dto;
  }
}
