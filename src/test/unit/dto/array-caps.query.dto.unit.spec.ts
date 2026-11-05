import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetEventsByIdsQueryDTO } from '../../../modules/event/dto/request/query/get-events-by-ids.query.dto.js';
import { SearchEventsQueryDTO } from '../../../modules/event/dto/request/query/search-events.query.dto.js';

const uuids = (n: number): string[] =>
  Array.from({ length: n }, (_, i) => `00000000-0000-4000-8000-${i.toString().padStart(12, '0')}`);

describe('GetEventsByIdsQueryDTO caps (Unit)', () => {
  const build = (n: number) => plainToInstance(GetEventsByIdsQueryDTO, { ids: uuids(n) });

  it('should accept 100 ids', async () => {
    expect(await validate(build(100))).toHaveLength(0);
  });

  it('should reject 101 ids', async () => {
    const errors = await validate(build(101));
    expect(errors[0].property).toBe('ids');
  });

  it('should reject non string items', async () => {
    const dto = plainToInstance(GetEventsByIdsQueryDTO, { ids: [1] });
    expect((await validate(dto))[0].property).toBe('ids');
  });
});

describe.each(['ids', 'excludedIds', 'excludedOrganizerIds'] as const)(
  'SearchEventsQueryDTO %s cap (Unit)',
  (field) => {
    const build = (n: number) => plainToInstance(SearchEventsQueryDTO, { [field]: uuids(n) });

    it('should accept 1000 ids', async () => {
      expect(await validate(build(1000))).toHaveLength(0);
    });

    it('should reject 1001 ids', async () => {
      const errors = await validate(build(1001));
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  },
);
