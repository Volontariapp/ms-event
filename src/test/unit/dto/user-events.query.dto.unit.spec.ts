import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  GetUserCreatedEventsQueryDTO,
  GetUserParticipatedEventsQueryDTO,
  GetUserWishedEventsQueryDTO,
} from '../../../modules/event/dto/request/query/event.query.dto.js';
import { MAX_PAGINATION_LIMIT } from '../../../modules/event/dto/common/pagination.dto.js';

const DTO_CLASSES = [
  GetUserCreatedEventsQueryDTO,
  GetUserParticipatedEventsQueryDTO,
  GetUserWishedEventsQueryDTO,
];

describe.each(DTO_CLASSES)('%p pagination (Unit)', (DtoClass) => {
  const build = (pagination?: { page: number; limit: number }) =>
    plainToInstance(DtoClass, { pagination });

  it('should expose a plafond of 100', () => {
    expect(MAX_PAGINATION_LIMIT).toBe(100);
  });

  it('should accept a missing pagination', async () => {
    expect(await validate(build())).toHaveLength(0);
  });

  it.each([
    { page: 1, limit: 10 },
    { page: 1, limit: 100 },
  ])('should accept %j', async (pagination) => {
    expect(await validate(build(pagination))).toHaveLength(0);
  });

  it.each([
    { name: 'limit above the plafond', pagination: { page: 1, limit: 101 } },
    { name: 'page zero', pagination: { page: 0, limit: 10 } },
    { name: 'limit zero', pagination: { page: 1, limit: 0 } },
    { name: 'non integer limit', pagination: { page: 1, limit: 2.5 } },
  ])('should reject $name', async ({ pagination }) => {
    const errors = await validate(build(pagination));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('pagination');
  });
});
