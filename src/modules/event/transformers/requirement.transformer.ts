import { Injectable } from '@nestjs/common';
import { RequirementEntity } from '@volontariapp/domain-event';
import { RequirementDTO } from '../dto/common/common.dto.js';

@Injectable()
export class RequirementTransformer {
  toEntity(dto: Partial<RequirementDTO>): RequirementEntity {
    const entity = new RequirementEntity();
    if (dto.id !== undefined) entity.id = dto.id;
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.neededQuantity !== undefined) entity.quantity = dto.neededQuantity;
    if (dto.currentQuantity !== undefined)
      entity.currentQuantity = dto.currentQuantity;
    entity.isSystem = false;
    return entity;
  }

  toDto(entity: RequirementEntity): RequirementDTO {
    const dto = new RequirementDTO();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.neededQuantity = entity.quantity;
    dto.currentQuantity = entity.currentQuantity;
    return dto;
  }
}
