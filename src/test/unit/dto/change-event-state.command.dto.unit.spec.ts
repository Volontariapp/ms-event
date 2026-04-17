import 'reflect-metadata';
import { validate } from 'class-validator';
import { createChangeEventStateDTO } from '../../factories/event.factory.js';
import type { EventState } from '@volontariapp/contracts-nest';
import { describe, it, expect } from '@jest/globals';

describe('ChangeEventStateCommandDTO (Unit)', () => {
  it('should validate a valid DTO', async () => {
    const dto = createChangeEventStateDTO();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('id', () => {
    it('should fail if id is missing', async () => {
      const dto = createChangeEventStateDTO({
        id: undefined as unknown as string,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });

    it('should fail if id is not a UUID', async () => {
      const dto = createChangeEventStateDTO({ id: 'invalid-uuid' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });
  });

  describe('newState', () => {
    it('should fail if newState is invalid', async () => {
      const dto = createChangeEventStateDTO({
        newState: 'INVALID_STATE' as unknown as EventState,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('newState');
    });
  });
});
