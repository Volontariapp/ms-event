import { validate } from 'class-validator';
import { createSearchEventsQueryDTO } from '../../factories/event.factory.js';
import { describe, it, expect } from '@jest/globals';
import type { EventType } from '@volontariapp/contracts-nest';

describe('SearchEventsQueryDTO (Unit)', () => {
  it('should validate a valid DTO', async () => {
    const dto = createSearchEventsQueryDTO();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('types', () => {
    it('should fail if types contains invalid enum values', async () => {
      const dto = createSearchEventsQueryDTO({
        types: ['INVALID_TYPE' as unknown as EventType],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('types');
    });
  });

  describe('organizerId', () => {
    it('should fail if organizerId is not a UUID', async () => {
      const dto = createSearchEventsQueryDTO({ organizerId: 'invalid-uuid' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('organizerId');
    });
  });

  describe('onlyAvailable', () => {
    it('should fail if onlyAvailable is not a boolean', async () => {
      const dto = createSearchEventsQueryDTO({
        onlyAvailable: 'true' as unknown as boolean,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('onlyAvailable');
    });
  });

  describe('endAtFrom', () => {
    it('should accept a valid ISO date string', async () => {
      const dto = createSearchEventsQueryDTO({ endAtFrom: '2026-11-07T10:00:00.000Z' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept an absent value', async () => {
      const dto = createSearchEventsQueryDTO();
      expect(dto.endAtFrom).toBeUndefined();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if endAtFrom is not an ISO 8601 date', async () => {
      const dto = createSearchEventsQueryDTO({
        endAtFrom: 'pas-une-date',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('endAtFrom');
    });
  });
});
