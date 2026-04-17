import { validate } from 'class-validator';
import { createUpdateEventDTO } from '../../factories/event.factory.js';
import { describe, it, expect } from '@jest/globals';
import { UpdateEventDataDTO } from '../../../modules/event/dto/common/event/update-event-data.dto.js';

describe('UpdateEventCommandDTO (Unit)', () => {
  it('should validate a valid DTO', async () => {
    const dto = createUpdateEventDTO();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('id', () => {
    it('should fail if id is missing', async () => {
      const dto = createUpdateEventDTO({ id: undefined as unknown as string });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });

    it('should fail if id is not a UUID', async () => {
      const dto = createUpdateEventDTO({ id: 'invalid-uuid' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });
  });

  describe('updateMask', () => {
    it('should fail if updateMask is not an array', async () => {
      const dto = createUpdateEventDTO({ updateMask: 'title' as any });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('updateMask');
    });

    it('should fail if updateMask contains non-string values', async () => {
      const dto = createUpdateEventDTO({ updateMask: [123] as any });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('updateMask');
    });
  });

  describe('event (nested)', () => {
    it('should fail if nested event data is invalid', async () => {
      const nestedEvent = new UpdateEventDataDTO();
      nestedEvent.title = 123 as any; // Should be string

      const dto = createUpdateEventDTO({ event: nestedEvent as any });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('event');
    });
  });
});
