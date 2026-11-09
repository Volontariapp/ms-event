import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IsUUIDList } from '../../../modules/event/dto/validators/is-uuid-list.validator.js';
import { SearchEventsQueryDTO } from '../../../modules/event/dto/request/query/search-events.query.dto.js';

class ListDTO {
  @IsUUIDList()
  values!: unknown;
}

const uuid = (i: number): string => `00000000-0000-4000-8000-${i.toString().padStart(12, '0')}`;
const uuids = (n: number): string[] => Array.from({ length: n }, (_, i) => uuid(i));
const run = (values: unknown) => validate(plainToInstance(ListDTO, { values }));

describe('IsUUIDList (Unit)', () => {
  it('accepts a valid list of 2000 uuids', async () => {
    expect(await run(uuids(2000))).toHaveLength(0);
  });

  it('accepts an empty list', async () => {
    expect(await run([])).toHaveLength(0);
  });

  it('accepts every version accepted by IsUUID all, nil and max, any case', async () => {
    const list = [
      '00000000-0000-0000-0000-000000000000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '123E4567-E89B-12D3-A456-426614174000',
      '018f3c7e-5a1b-7c2d-8e3f-0123456789ab',
    ];
    expect(await run(list)).toHaveLength(0);
  });

  it.each([0, 1, 999, 1999])('rejects a single invalid item at position %i', async (pos) => {
    const list = uuids(2000);
    list[pos] = 'not-a-uuid';
    const errors = await run(list);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('values');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(['isUuid']);
    expect(errors[0].constraints?.isUuid).toBe('each value in values must be a UUID');
  });

  it.each([
    ['a number', 1],
    ['null', null],
    ['undefined', undefined],
    ['an object', {}],
    ['a string object like', ['x'].toString()],
  ])('rejects a non-string item: %s', async (_label, bad) => {
    const list: unknown[] = [uuid(1), bad, uuid(2)];
    expect(await run(list)).toHaveLength(1);
  });

  it('rejects a value that is not an array', async () => {
    expect(await run(uuid(1))).toHaveLength(1);
    expect(await run(undefined)).toHaveLength(1);
  });

  it('rejects near misses (suffix, prefix, newline, wrong variant)', async () => {
    const base = uuid(1);
    for (const bad of [
      `${base}x`,
      `x${base}`,
      `${base}\n`,
      ` ${base}`,
      '00000000-0000-4000-c000-000000000001',
      '00000000-0000-9000-8000-000000000001',
    ]) {
      expect(await run([bad])).toHaveLength(1);
    }
  });
});

describe.each(['ids', 'excludedIds', 'excludedOrganizerIds'] as const)(
  'SearchEventsQueryDTO %s uuid list (Unit)',
  (field) => {
    it('rejects an invalid item', async () => {
      const dto = plainToInstance(SearchEventsQueryDTO, { [field]: [uuid(1), 'nope'] });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it('rejects a list over the maximum size', async () => {
      const dto = plainToInstance(SearchEventsQueryDTO, { [field]: uuids(1001) });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  },
);
