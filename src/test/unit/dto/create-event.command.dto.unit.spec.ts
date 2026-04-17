import { validate } from 'class-validator';
import { createCreateEventDTO } from '../../factories/event.factory.js';
import type { EventType } from '@volontariapp/contracts-nest';
import { describe, it, expect } from '@jest/globals';

describe('CreateEventCommandDTO (Unit)', () => {
  it('should validate a valid DTO', async () => {
    const dto = createCreateEventDTO();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('title', () => {
    it('should fail if title is missing', async () => {
      const dto = createCreateEventDTO({
        title: undefined as unknown as string,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should fail if title is not a string', async () => {
      const dto = createCreateEventDTO({ title: 123 as unknown as string });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });
  });

  describe('type', () => {
    it('should fail if type is invalid', async () => {
      const dto = createCreateEventDTO({
        type: 'INVALID_TYPE' as unknown as EventType,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });
  });

  describe('maxParticipants', () => {
    it('should fail if maxParticipants is less than 1', async () => {
      const dto = createCreateEventDTO({ maxParticipants: 0 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxParticipants');
    });
  });

  describe('tagIds', () => {
    it('should fail if tagIds contains non-UUID strings', async () => {
      const dto = createCreateEventDTO({ tagIds: ['invalid-uuid'] });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('tagIds');
    });
  });
});
