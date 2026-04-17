import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EventCommandController } from '../../../modules/event/controllers/event.command.controller.js';
import type {
  EventEntity,
  EventService,
  RequirementService,
} from '@volontariapp/domain-event';
import type { EventTransformer } from '../../../modules/event/transformers/index.js';
import type { EventDTO } from '../../../modules/event/dto/common/event/event.dto.js';
import {
  createCreateEventDTO,
  createChangeEventStateDTO,
} from '../../factories/event.factory.js';

describe('EventCommandController (Unit)', () => {
  let controller: EventCommandController;
  let eventService: jest.Mocked<EventService>;
  let requirementService: jest.Mocked<RequirementService>;
  let eventTransformer: jest.Mocked<EventTransformer>;

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

    controller = new EventCommandController(
      eventService,
      requirementService,
      eventTransformer,
    );
  });

  describe('createEvent', () => {
    it('should create an event and return the response', async () => {
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

      const result = await controller.createEvent(dto);

      expect(result).toEqual({ event: responseDto });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventService.create).toHaveBeenCalled();
    });
  });

  describe('changeEventState', () => {
    it('should change event state and return the response', async () => {
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

      const result = await controller.changeEventState(dto);

      expect(result).toEqual({ event: responseDto });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventService.changeState).toHaveBeenCalledWith(
        dto.id,
        dto.newState,
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event and return success', async () => {
      const dto = { id: 'uuid' };
      eventService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteEvent(dto);

      expect(result).toEqual({ success: true });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventService.delete).toHaveBeenCalledWith(dto.id);
    });
  });
});
