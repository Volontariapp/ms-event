import 'reflect-metadata';
import { validate } from 'class-validator';
import { describe, it, expect } from '@jest/globals';
import { ManageRequirementCommandDTO } from '../../../modules/event/dto/request/command/manage-requirement.command.dto.js';
import { AddRequirementDTO } from '../../../modules/event/dto/common/requirement/add-requirement.dto.js';

describe('ManageRequirementCommandDTO (Unit)', () => {
  it('should validate a valid DTO', async () => {
    const dto = new ManageRequirementCommandDTO();
    dto.eventId = '550e8400-e29b-41d4-a716-446655440000';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('eventId', () => {
    it('should fail if eventId is missing', async () => {
      const dto = new ManageRequirementCommandDTO();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('eventId');
    });

    it('should fail if eventId is not a UUID', async () => {
      const dto = new ManageRequirementCommandDTO();
      dto.eventId = 'invalid-uuid';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('eventId');
    });
  });

  describe('add (nested)', () => {
    it('should fail if nested add requirement data is invalid', async () => {
      const dto = new ManageRequirementCommandDTO();
      dto.eventId = '550e8400-e29b-41d4-a716-446655440000';

      const addDto = new AddRequirementDTO();
      addDto.name = undefined as unknown as string; // for testing purpose

      dto.add = addDto;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('add');
    });
  });
});
