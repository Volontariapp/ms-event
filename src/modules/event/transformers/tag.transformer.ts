import { Injectable } from '@nestjs/common';
import { TagEntity } from '@volontariapp/domain-event';
import { TagDTO } from '../dto/common/common.dto.js';

@Injectable()
export class TagTransformer {
  toEntity(dto: Partial<TagDTO>): TagEntity {
    const entity = new TagEntity();
    if (dto.id !== undefined) entity.id = dto.id;
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.slug !== undefined) entity.slug = dto.slug;
    if (dto.balise !== undefined) entity.balise = dto.balise;
    return entity;
  }

  toDto(entity: TagEntity): TagDTO {
    const dto = new TagDTO();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.slug = entity.slug;
    dto.balise = entity.balise;
    return dto;
  }
}
