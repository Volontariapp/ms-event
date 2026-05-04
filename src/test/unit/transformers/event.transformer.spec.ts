import { describe, it, expect, beforeEach } from '@jest/globals';
import { EventTransformer } from './../../../modules/event/transformers/index.js';
import { TagTransformer } from './../../../modules/event/transformers/tag.transformer.js';
import { RequirementTransformer } from './../../../modules/event/transformers/requirement.transformer.js';
import { CreateEventCommandFactory } from '../../../__test-utils__/factories/create-event-command.factory.js';
import { randomUUID } from 'crypto';

describe('EventTransformer with userId', () => {
  let eventTransformer: EventTransformer;

  beforeEach(() => {
    const tagTransformer = new TagTransformer();
    const requirementTransformer = new RequirementTransformer();
    eventTransformer = new EventTransformer(tagTransformer, requirementTransformer);
  });

  describe('fromCreateCommand', () => {
    it('should set organizerId from userId parameter', () => {
      const userId = randomUUID();
      const createDto = CreateEventCommandFactory.create();

      const entity = eventTransformer.fromCreateCommand(createDto, userId);

      expect(entity.organizerId).toBe(userId);
      expect(entity.name).toBe(createDto.title);
      expect(entity.description).toBe(createDto.description);
    });

    it('should map all fields correctly with userId', () => {
      const userId = randomUUID();
      const createDto = CreateEventCommandFactory.create({
        title: 'Test Event',
        description: 'Test Description',
        maxParticipants: 100,
        awardedImpactScore: 25,
      });

      const entity = eventTransformer.fromCreateCommand(createDto, userId);

      expect(entity.organizerId).toBe(userId);
      expect(entity.name).toBe('Test Event');
      expect(entity.description).toBe('Test Description');
      expect(entity.maxParticipants).toBe(100);
      expect(entity.awardedImpactScore).toBe(25);
    });

    it('should handle different userId values', () => {
      const userId1 = randomUUID();
      const userId2 = randomUUID();
      const createDto = CreateEventCommandFactory.create();

      const entity1 = eventTransformer.fromCreateCommand(createDto, userId1);
      const entity2 = eventTransformer.fromCreateCommand(createDto, userId2);

      expect(entity1.organizerId).toBe(userId1);
      expect(entity2.organizerId).toBe(userId2);
      expect(entity1.organizerId).not.toBe(entity2.organizerId);
    });

    it('should map dates correctly', () => {
      const userId = randomUUID();
      const createDto = CreateEventCommandFactory.create();

      const entity = eventTransformer.fromCreateCommand(createDto, userId);

      expect(entity.startAt).toBeDefined();
      expect(entity.endAt).toBeDefined();
      expect(entity.startAt instanceof Date).toBe(true);
      expect(entity.endAt instanceof Date).toBe(true);
    });

    it('should map tags correctly', () => {
      const userId = randomUUID();
      const tagIds = [randomUUID(), randomUUID()];
      const createDto = CreateEventCommandFactory.create({ tagIds });

      const entity = eventTransformer.fromCreateCommand(createDto, userId);

      expect(entity.tags).toHaveLength(2);
      expect(entity.tags?.[0].id).toBe(tagIds[0]);
      expect(entity.tags?.[1].id).toBe(tagIds[1]);
    });
  });
});
