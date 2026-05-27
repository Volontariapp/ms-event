import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { EventCommandController } from '../../../modules/event/controllers/commands/event.command.controller.js';
import type { EventEntity, EventService, RequirementService } from '@volontariapp/domain-event';
import type { EventTransformer } from '../../../modules/event/transformers/index.js';
import type { EventDTO } from '../../../modules/event/dto/common/event/event.dto.js';
import { createCreateEventDTO, createChangeEventStateDTO } from '../../factories/event.factory.js';
import { AuthUserFactory } from '../../../__test-utils__/factories/auth-user.factory.js';
import type { DataSource } from 'typeorm';
import { JobsOutboxModel } from '@volontariapp/database';
import { JobsOutboxRepository } from '@volontariapp/outbox';
import { EventsJobType } from '@volontariapp/messaging';
import { NotFoundError, PartialContentError } from '@volontariapp/errors';

describe('EventCommandController (Unit)', () => {
  let controller: EventCommandController;
  let eventService: jest.Mocked<EventService>;
  let requirementService: jest.Mocked<RequirementService>;
  let eventTransformer: jest.Mocked<EventTransformer>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    jest.restoreAllMocks();

    eventService = {
      create: jest.fn(),
      update: jest.fn(),
      changeState: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<EventService>;

    requirementService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<RequirementService>;

    eventTransformer = {
      fromCreateCommand: jest.fn(),
      fromEventDTO: jest.fn(),
      toEventDTO: jest.fn(),
    } as unknown as jest.Mocked<EventTransformer>;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue({}),
    } as unknown as jest.Mocked<DataSource>;

    controller = new EventCommandController(
      eventService,
      requirementService,
      eventTransformer,
      mockDataSource,
    );
  });

  describe('createEvent', () => {
    it('should create an event and return the response', async () => {
      const user = AuthUserFactory.create();
      const dto = createCreateEventDTO();
      const entity = { id: 'uuid', title: dto.title } as unknown as EventEntity;
      const responseDto = {
        id: 'uuid',
        title: dto.title,
      } as unknown as EventDTO;

      eventTransformer.fromCreateCommand.mockReturnValue({
        title: dto.title,
      } as unknown as EventEntity);
      eventService.create.mockResolvedValue(entity);
      eventTransformer.toEventDTO.mockReturnValue(responseDto);

      const result = await controller.createEvent(dto, user);

      expect(result).toEqual({ event: responseDto });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventTransformer.fromCreateCommand).toHaveBeenCalledWith(dto, user.id);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventService.create).toHaveBeenCalled();
    });
  });

  describe('changeEventState', () => {
    it('should change event state and return the response', async () => {
      const user = AuthUserFactory.create();
      const dto = createChangeEventStateDTO();
      const entity = {
        id: dto.id,
        state: dto.newState,
      } as unknown as EventEntity;
      const responseDto = {
        id: dto.id,
        state: dto.newState,
      } as unknown as EventDTO;

      eventService.changeState.mockResolvedValue(entity);
      eventTransformer.toEventDTO.mockReturnValue(responseDto);

      const result = await controller.changeEventState(dto, user);

      expect(result).toEqual({ event: responseDto });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventService.changeState).toHaveBeenCalledWith(dto.id, dto.newState);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event and return success', async () => {
      const user = AuthUserFactory.create();
      const dto = { id: 'uuid' };
      eventService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteEvent(dto, user);

      expect(result).toEqual({ success: true });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventService.delete).toHaveBeenCalledWith(dto.id);
    });
  });

  describe('Fallback mechanism', () => {
    let createSpy: jest.SpiedFunction<typeof JobsOutboxRepository.prototype.create>;

    beforeEach(() => {
      createSpy = jest
        .spyOn(JobsOutboxRepository.prototype, 'create')
        .mockImplementation(() => Promise.resolve({} as never));
    });

    afterEach(() => {
      createSpy.mockRestore();
    });

    it('should create a fallback job in outbox when an unexpected error occurs', async () => {
      const user = AuthUserFactory.create();
      const dto = { id: 'uuid' };
      const spyGetRepo = jest.spyOn(mockDataSource, 'getRepository');
      const mockError = new Error('Unexpected DB Error');

      eventService.delete.mockRejectedValue(mockError);

      await expect(controller.deleteEvent(dto, user)).rejects.toThrow(PartialContentError);

      expect(spyGetRepo).toHaveBeenCalledWith(JobsOutboxModel);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EventsJobType.FALLBACK_DELETE_EVENT,
          emitter: 'ms-event',
          emitterId: user.id,
          target: 'fallback-event-queue',
        }),
      );
    });

    it('should NOT create a fallback job for Api Errors like 404', async () => {
      const user = AuthUserFactory.create();
      const dto = { id: 'uuid' };
      const mockError = new NotFoundError('Event not found');

      eventService.delete.mockRejectedValue(mockError);

      await expect(controller.deleteEvent(dto, user)).rejects.toThrow('Event not found');

      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
