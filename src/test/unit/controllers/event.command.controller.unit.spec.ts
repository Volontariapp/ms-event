import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EventCommandController } from '../../../modules/event/controllers/commands/event.command.controller.js';
import {
  EventService,
  RequirementService,
  EventEntity,
  EventLocation,
  RequirementEntity,
} from '@volontariapp/domain-event';
import {
  EventTransformer,
  TagTransformer,
  RequirementTransformer,
} from '../../../modules/event/transformers/index.js';
import { StorageClientService } from '@volontariapp/storage-client';
import {
  CoverStatus,
  EventState,
  EventType,
  FileStatus,
  ScanStatus,
  ValidationMode,
  type FileMetadata,
  type ConfirmFileAttachmentResponse,
  type Event,
} from '@volontariapp/contracts-nest';
import {
  NotFoundError,
  InternalServerError,
  ForbiddenError,
  PartialContentError,
} from '@volontariapp/errors';
import { SagaStatus, UserRoles } from '@volontariapp/shared';
import type { AuthUser } from '@volontariapp/auth';
import { CreateEventCommandDTO } from '../../../modules/event/dto/request/command/create-event.command.dto.js';
import type { UpdateEventCommandDTO } from '../../../modules/event/dto/request/command/update-event.command.dto.js';
import type { ChangeEventStateCommandDTO } from '../../../modules/event/dto/request/command/change-event-state.command.dto.js';
import type { ManageRequirementCommandDTO } from '../../../modules/event/dto/request/command/manage-requirement.command.dto.js';
import { v5 as uuidv5 } from 'uuid';
import { AppConfigService } from '../../../config/app-config.service.js';
import { JobsOutboxModel } from '@volontariapp/database';
import { JobsOutboxRepository } from '@volontariapp/outbox';
import { JobMessagingType } from '@volontariapp/messaging';
import { GrpcDateMapper } from '@volontariapp/contracts-nest';

const TEST_EVENT_NAMESPACE = 'a2d04a60-9d04-4e4b-97e3-0d3f23c7c2b6';

interface MockEventService {
  create: jest.Mock;
  update: jest.Mock;
  changeState: jest.Mock;
  delete: jest.Mock;
  findById: jest.Mock;
}

interface MockRequirementService {
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

interface MockStorageClientService {
  confirmEventCoverAttachment: jest.Mock;
}

interface MockAppConfigService {
  eventIdNamespace: string;
}

interface MockDataSource {
  getRepository: jest.Mock;
}

function createMockFileMetadata(overrides: Partial<FileMetadata> = {}): FileMetadata {
  return {
    id: overrides.id ?? 'default-file-id',
    ownerId: overrides.ownerId ?? 'default-owner-id',
    objectKey: overrides.objectKey ?? 'event/cover.webp',
    mimeType: overrides.mimeType ?? 'image/jpeg',
    status: overrides.status ?? FileStatus.FILE_STATUS_ATTACHED,
    validationMode: overrides.validationMode ?? ValidationMode.VALIDATION_MODE_SYNC,
    isPublic: overrides.isPublic ?? true,
    uploadExpiresAt: overrides.uploadExpiresAt,
    createdAt: overrides.createdAt,
    updatedAt: overrides.updatedAt,
    scanStatus: overrides.scanStatus ?? ScanStatus.SCAN_STATUS_CLEAN,
    rejectionReason: overrides.rejectionReason,
    publicUrl: overrides.publicUrl,
    entityType: overrides.entityType,
    entityId: overrides.entityId,
  };
}

function createMockEvent(overrides: Partial<EventEntity> = {}): EventEntity {
  const event = new EventEntity();
  event.id = overrides.id ?? 'default-event-id';
  event.name = overrides.name ?? 'Default Event Title';
  event.description = overrides.description ?? 'Default Description';
  event.startAt = overrides.startAt ?? new Date('2026-10-15T10:00:00Z');
  event.endAt = overrides.endAt ?? new Date('2026-10-15T12:00:00Z');
  event.location = overrides.location ?? new EventLocation(48.8566, 2.3522);
  event.localisationName = overrides.localisationName ?? 'Paris';
  event.type = overrides.type ?? EventType.EVENT_TYPE_SOCIAL;
  event.state = overrides.state ?? EventState.EVENT_STATE_PUBLISHED;
  event.saga_status = overrides.saga_status ?? SagaStatus.PENDING;
  event.awardedImpactScore = overrides.awardedImpactScore ?? 10;
  event.maxParticipants = overrides.maxParticipants ?? 50;
  event.currentParticipants = overrides.currentParticipants ?? 0;
  event.organizerId = overrides.organizerId ?? '11111111-1111-1111-1111-111111111111';
  event.createdAt = overrides.createdAt ?? new Date();
  event.updatedAt = overrides.updatedAt ?? new Date();
  event.coverFileId = overrides.coverFileId;
  event.coverStatus = overrides.coverStatus ?? CoverStatus.COVER_STATUS_NONE;
  event.tags = overrides.tags ?? [];
  event.requirements = overrides.requirements ?? [];
  return event;
}

function createMockEventProto(overrides: Partial<Event> = {}): Event {
  return {
    id: overrides.id ?? 'event-123',
    title: overrides.title ?? 'Event Title',
    description: overrides.description ?? 'Description',
    startAt: overrides.startAt ?? GrpcDateMapper.toTimestamp(new Date('2026-10-15T10:00:00Z')),
    endAt: overrides.endAt ?? GrpcDateMapper.toTimestamp(new Date('2026-10-15T12:00:00Z')),
    location: overrides.location ?? { latitude: 48.8566, longitude: 2.3522 },
    localisationName: overrides.localisationName ?? 'Paris',
    type: overrides.type ?? EventType.EVENT_TYPE_SOCIAL,
    state: overrides.state ?? EventState.EVENT_STATE_PUBLISHED,
    awardedImpactScore: overrides.awardedImpactScore ?? 10,
    maxParticipants: overrides.maxParticipants ?? 50,
    currentParticipants: overrides.currentParticipants ?? 0,
    organizerId: overrides.organizerId ?? '11111111-1111-1111-1111-111111111111',
    tags: overrides.tags ?? [],
    requirements: overrides.requirements ?? [],
    coverFileId: overrides.coverFileId,
    coverStatus: overrides.coverStatus ?? CoverStatus.COVER_STATUS_NONE,
  };
}

function createMockRequirement(overrides: Partial<RequirementEntity> = {}): RequirementEntity {
  const req = new RequirementEntity();
  req.id = overrides.id ?? 'req-1';
  req.name = overrides.name ?? 'Chairs';
  req.description = overrides.description ?? 'Folding chairs';
  req.quantity = overrides.quantity ?? 10;
  req.currentQuantity = overrides.currentQuantity ?? 0;
  req.isSystem = overrides.isSystem ?? false;
  req.createdBy = overrides.createdBy ?? '11111111-1111-1111-1111-111111111111';
  return req;
}

function createBaseDto(overrides: Partial<CreateEventCommandDTO> = {}): CreateEventCommandDTO {
  const dto = new CreateEventCommandDTO();
  dto.title = overrides.title ?? 'Charity Gala';
  dto.description = overrides.description ?? 'Annual charity gala event';
  dto.startAt = overrides.startAt ?? GrpcDateMapper.toTimestamp(new Date('2026-10-15T10:00:00Z'));
  dto.endAt = overrides.endAt ?? GrpcDateMapper.toTimestamp(new Date('2026-10-15T12:00:00Z'));
  dto.localisationName = overrides.localisationName ?? 'Paris';
  dto.type = overrides.type ?? EventType.EVENT_TYPE_SOCIAL;
  dto.awardedImpactScore = overrides.awardedImpactScore ?? 15;
  dto.maxParticipants = overrides.maxParticipants ?? 100;
  dto.tagIds = overrides.tagIds ?? [];
  dto.idempotencyKey = overrides.idempotencyKey ?? 'event-key-123';
  if (overrides.coverFileId) {
    dto.coverFileId = overrides.coverFileId;
  }
  return dto;
}

describe('EventCommandController (Unit)', () => {
  let controller: EventCommandController;
  let eventService: EventService;
  let requirementService: RequirementService;
  let storageClientService: StorageClientService;
  let mockDataSource: MockDataSource;

  const mockUser: AuthUser = {
    id: '11111111-1111-1111-1111-111111111111',
    role: UserRoles.VOLUNTEER,
  };

  const mockEventService: MockEventService = {
    create: jest.fn(),
    update: jest.fn(),
    changeState: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
  };

  const mockRequirementService: MockRequirementService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockStorageClientService: MockStorageClientService = {
    confirmEventCoverAttachment: jest.fn(),
  };

  const mockAppConfigService: MockAppConfigService = {
    eventIdNamespace: TEST_EVENT_NAMESPACE,
  };

  beforeEach(async () => {
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventCommandController],
      providers: [
        TagTransformer,
        RequirementTransformer,
        EventTransformer,
        {
          provide: EventService,
          useValue: mockEventService,
        },
        {
          provide: RequirementService,
          useValue: mockRequirementService,
        },
        {
          provide: StorageClientService,
          useValue: mockStorageClientService,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<EventCommandController>(EventCommandController);
    eventService = module.get<EventService>(EventService);
    requirementService = module.get<RequirementService>(RequirementService);
    storageClientService = module.get<StorageClientService>(StorageClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create event without cover when coverFileId is not provided', async () => {
      const dto = createBaseDto();
      const expectedEventId = uuidv5(`${mockUser.id}:${dto.idempotencyKey}`, TEST_EVENT_NAMESPACE);

      const createdEntity = createMockEvent({
        id: expectedEventId,
        name: dto.title,
        description: dto.description,
        organizerId: mockUser.id,
        coverStatus: CoverStatus.COVER_STATUS_NONE,
        coverFileId: undefined,
      });

      const storageSpy = jest.spyOn(storageClientService, 'confirmEventCoverAttachment');
      const createSpy = jest.spyOn(eventService, 'create').mockResolvedValue(createdEntity);

      const result = await controller.createEvent(dto, mockUser);

      expect(storageSpy).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expectedEventId,
          name: dto.title,
          description: dto.description,
          state: EventState.EVENT_STATE_PUBLISHED,
          coverStatus: CoverStatus.COVER_STATUS_NONE,
        }),
      );
      expect(result.event).toBeDefined();
      if (!result.event) throw new Error('result.event is undefined');
      expect(result.event.id).toBe(expectedEventId);
      expect(result.event.state).toBe(EventState.EVENT_STATE_PUBLISHED);
      expect(result.event.coverStatus).toBe(CoverStatus.COVER_STATUS_NONE);
      expect(result.event.coverFileId).toBeUndefined();
    });

    it('should confirm attachment and set READY when cover file is clean', async () => {
      const coverFileId = '22222222-2222-2222-2222-222222222222';
      const dto = createBaseDto({
        coverFileId,
        idempotencyKey: 'event-key-cover-clean',
      });
      const expectedEventId = uuidv5(`${mockUser.id}:${dto.idempotencyKey}`, TEST_EVENT_NAMESPACE);

      const createdEntity = createMockEvent({
        id: expectedEventId,
        name: dto.title,
        description: dto.description,
        organizerId: mockUser.id,
        coverFileId,
        coverStatus: CoverStatus.COVER_STATUS_READY,
      });

      const mockResponse: ConfirmFileAttachmentResponse = {
        success: true,
        updatedCount: 1,
        files: [
          createMockFileMetadata({
            id: coverFileId,
            ownerId: mockUser.id,
            status: FileStatus.FILE_STATUS_ATTACHED,
            scanStatus: ScanStatus.SCAN_STATUS_CLEAN,
          }),
        ],
      };

      const storageSpy = jest
        .spyOn(storageClientService, 'confirmEventCoverAttachment')
        .mockResolvedValue(mockResponse);
      const createSpy = jest.spyOn(eventService, 'create').mockResolvedValue(createdEntity);

      const result = await controller.createEvent(dto, mockUser);

      expect(storageSpy).toHaveBeenCalledWith(expectedEventId, coverFileId);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expectedEventId,
          coverFileId,
          coverStatus: CoverStatus.COVER_STATUS_READY,
        }),
      );
      expect(result.event).toBeDefined();
      if (!result.event) throw new Error('result.event is undefined');
      expect(result.event.id).toBe(expectedEventId);
      expect(result.event.coverStatus).toBe(CoverStatus.COVER_STATUS_READY);
      expect(result.event.coverFileId).toBe(coverFileId);
    });

    it('should confirm attachment and set PENDING when cover file is scanning', async () => {
      const coverFileId = '33333333-3333-3333-3333-333333333333';
      const dto = createBaseDto({
        coverFileId,
        idempotencyKey: 'event-key-cover-scanning',
      });
      const expectedEventId = uuidv5(`${mockUser.id}:${dto.idempotencyKey}`, TEST_EVENT_NAMESPACE);

      const createdEntity = createMockEvent({
        id: expectedEventId,
        name: dto.title,
        description: dto.description,
        organizerId: mockUser.id,
        coverFileId,
        coverStatus: CoverStatus.COVER_STATUS_PENDING,
      });

      const mockResponse: ConfirmFileAttachmentResponse = {
        success: true,
        updatedCount: 1,
        files: [
          createMockFileMetadata({
            id: coverFileId,
            ownerId: mockUser.id,
            status: FileStatus.FILE_STATUS_ATTACHED,
            scanStatus: ScanStatus.SCAN_STATUS_SCANNING,
          }),
        ],
      };

      const storageSpy = jest
        .spyOn(storageClientService, 'confirmEventCoverAttachment')
        .mockResolvedValue(mockResponse);
      const createSpy = jest.spyOn(eventService, 'create').mockResolvedValue(createdEntity);

      const result = await controller.createEvent(dto, mockUser);

      expect(storageSpy).toHaveBeenCalledWith(expectedEventId, coverFileId);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expectedEventId,
          coverFileId,
          coverStatus: CoverStatus.COVER_STATUS_PENDING,
        }),
      );
      expect(result.event).toBeDefined();
      if (!result.event) throw new Error('result.event is undefined');
      expect(result.event.coverStatus).toBe(CoverStatus.COVER_STATUS_PENDING);
    });

    it('should fall back to async PENDING when storage is unavailable (STORAGE_TIMEOUT)', async () => {
      const coverFileId = '44444444-4444-4444-4444-444444444444';
      const dto = createBaseDto({
        coverFileId,
        idempotencyKey: 'event-key-timeout',
      });
      const expectedEventId = uuidv5(`${mockUser.id}:${dto.idempotencyKey}`, TEST_EVENT_NAMESPACE);

      const createdEntity = createMockEvent({
        id: expectedEventId,
        name: dto.title,
        organizerId: mockUser.id,
        coverFileId,
        coverStatus: CoverStatus.COVER_STATUS_PENDING,
      });

      const storageSpy = jest
        .spyOn(storageClientService, 'confirmEventCoverAttachment')
        .mockRejectedValue(
          new InternalServerError('timeout', 'STORAGE_TIMEOUT', { timeoutMs: 2000 }),
        );
      const createSpy = jest.spyOn(eventService, 'create').mockResolvedValue(createdEntity);

      const result = await controller.createEvent(dto, mockUser);

      expect(storageSpy).toHaveBeenCalledWith(expectedEventId, coverFileId);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expectedEventId,
          coverFileId,
          coverStatus: CoverStatus.COVER_STATUS_PENDING,
        }),
      );
      expect(result.event).toBeDefined();
      if (!result.event) throw new Error('result.event is undefined');
      expect(result.event.coverStatus).toBe(CoverStatus.COVER_STATUS_PENDING);
    });

    it('should fall back to async PENDING when storage returns gRPC code 14 UNAVAILABLE', async () => {
      const coverFileId = '55555555-5555-5555-5555-555555555555';
      const dto = createBaseDto({
        coverFileId,
        idempotencyKey: 'event-key-unavailable',
      });
      const expectedEventId = uuidv5(`${mockUser.id}:${dto.idempotencyKey}`, TEST_EVENT_NAMESPACE);

      const createdEntity = createMockEvent({
        id: expectedEventId,
        name: dto.title,
        organizerId: mockUser.id,
        coverFileId,
        coverStatus: CoverStatus.COVER_STATUS_PENDING,
      });

      const storageSpy = jest
        .spyOn(storageClientService, 'confirmEventCoverAttachment')
        .mockRejectedValue({ code: 14, details: 'Connect Failed' });
      const createSpy = jest.spyOn(eventService, 'create').mockResolvedValue(createdEntity);

      const result = await controller.createEvent(dto, mockUser);

      expect(storageSpy).toHaveBeenCalledWith(expectedEventId, coverFileId);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expectedEventId,
          coverFileId,
          coverStatus: CoverStatus.COVER_STATUS_PENDING,
        }),
      );
      expect(result.event).toBeDefined();
      if (!result.event) throw new Error('result.event is undefined');
      expect(result.event.coverStatus).toBe(CoverStatus.COVER_STATUS_PENDING);
    });

    it('should rethrow error when storage reservation is rejected (e.g. NotFoundError)', async () => {
      const coverFileId = '66666666-6666-6666-6666-666666666666';
      const dto = createBaseDto({
        coverFileId,
        idempotencyKey: 'event-key-not-found',
      });
      const expectedEventId = uuidv5(`${mockUser.id}:${dto.idempotencyKey}`, TEST_EVENT_NAMESPACE);

      const storageSpy = jest
        .spyOn(storageClientService, 'confirmEventCoverAttachment')
        .mockRejectedValue(new NotFoundError(`File ${coverFileId} not found`));
      const createSpy = jest.spyOn(eventService, 'create');

      await expect(controller.createEvent(dto, mockUser)).rejects.toThrow(NotFoundError);
      expect(storageSpy).toHaveBeenCalledWith(expectedEventId, coverFileId);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateEvent', () => {
    it('should update an event and return response', async () => {
      const dto: UpdateEventCommandDTO = {
        id: 'event-123',
        event: createMockEventProto({
          id: 'event-123',
          title: 'Updated Gala',
        }),
        updateMask: ['title'],
      };

      const updatedEntity = createMockEvent({
        id: 'event-123',
        name: 'Updated Gala',
      });

      const updateSpy = jest.spyOn(eventService, 'update').mockResolvedValue(updatedEntity);

      const result = await controller.updateEvent(dto, mockUser);

      expect(updateSpy).toHaveBeenCalledWith(
        'event-123',
        expect.objectContaining({ name: 'Updated Gala' }),
      );
      expect(result.event).toBeDefined();
      if (!result.event) throw new Error('result.event is undefined');
      expect(result.event.title).toBe('Updated Gala');
    });
  });

  describe('changeEventState', () => {
    it('should change event state and return the response', async () => {
      const dto: ChangeEventStateCommandDTO = {
        id: 'event-123',
        newState: EventState.EVENT_STATE_PUBLISHED,
      };

      const updatedEntity = createMockEvent({
        id: 'event-123',
        state: EventState.EVENT_STATE_PUBLISHED,
      });

      const changeStateSpy = jest
        .spyOn(eventService, 'changeState')
        .mockResolvedValue(updatedEntity);

      const result = await controller.changeEventState(dto, mockUser);

      expect(changeStateSpy).toHaveBeenCalledWith(
        'event-123',
        EventState.EVENT_STATE_PUBLISHED,
        mockUser.id,
        UserRoles.VOLUNTEER,
      );
      expect(result.event).toBeDefined();
      if (!result.event) throw new Error('result.event is undefined');
      expect(result.event.state).toBe(EventState.EVENT_STATE_PUBLISHED);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event and return success for volunteer', async () => {
      const deleteSpy = jest.spyOn(eventService, 'delete').mockResolvedValue(undefined);

      const result = await controller.deleteEvent({ id: 'event-123' }, mockUser);

      expect(result).toEqual({ success: true });
      expect(deleteSpy).toHaveBeenCalledWith('event-123', mockUser.id, UserRoles.VOLUNTEER);
    });

    it('should pass an admin role through so the service can skip the ownership check', async () => {
      const adminUser: AuthUser = { id: 'admin-1', role: UserRoles.ADMIN };
      const deleteSpy = jest.spyOn(eventService, 'delete').mockResolvedValue(undefined);

      await controller.deleteEvent({ id: 'event-123' }, adminUser);

      expect(deleteSpy).toHaveBeenCalledWith('event-123', adminUser.id, UserRoles.ADMIN);
    });
  });

  describe('manageRequirements', () => {
    it('should add requirement when add is specified', async () => {
      const existingEvent = createMockEvent({
        id: 'event-123',
        organizerId: mockUser.id,
        requirements: [],
      });

      const newReq = createMockRequirement({
        id: 'req-1',
        name: 'Chairs',
        quantity: 10,
        isSystem: false,
        createdBy: mockUser.id,
      });

      jest.spyOn(eventService, 'findById').mockResolvedValue(existingEvent);
      jest.spyOn(requirementService, 'create').mockResolvedValue(newReq);
      const updateSpy = jest.spyOn(eventService, 'update').mockResolvedValue(existingEvent);

      const dto: ManageRequirementCommandDTO = {
        eventId: 'event-123',
        add: {
          name: 'Chairs',
          description: 'Folding chairs',
          neededQuantity: 10,
        },
      };

      const result = await controller.manageRequirements(dto, mockUser);

      expect(result).toEqual({ success: true, message: 'Requirement added' });
      expect(updateSpy).toHaveBeenCalledWith('event-123', {
        requirements: [newReq],
      });
    });

    it('should remove requirement when remove is specified and requirement exists', async () => {
      const existingReq = createMockRequirement({
        id: 'req-1',
        name: 'Chairs',
        quantity: 10,
        isSystem: false,
        createdBy: mockUser.id,
      });

      const existingEvent = createMockEvent({
        id: 'event-123',
        organizerId: mockUser.id,
        requirements: [existingReq],
      });

      jest.spyOn(eventService, 'findById').mockResolvedValue(existingEvent);
      const updateSpy = jest.spyOn(eventService, 'update').mockResolvedValue(existingEvent);

      const dto: ManageRequirementCommandDTO = {
        eventId: 'event-123',
        remove: {
          requirementId: 'req-1',
        },
      };

      const result = await controller.manageRequirements(dto, mockUser);

      expect(result).toEqual({ success: true, message: 'Requirement removed' });
      expect(updateSpy).toHaveBeenCalledWith('event-123', {
        requirements: [],
      });
    });

    it('should throw when requirement to remove does not exist', async () => {
      const existingEvent = createMockEvent({
        id: 'event-123',
        organizerId: mockUser.id,
        requirements: [],
      });

      jest.spyOn(eventService, 'findById').mockResolvedValue(existingEvent);

      const dto: ManageRequirementCommandDTO = {
        eventId: 'event-123',
        remove: {
          requirementId: 'non-existing',
        },
      };

      await expect(controller.manageRequirements(dto, mockUser)).rejects.toThrow();
    });
  });

  describe('Fallback mechanism', () => {
    let outboxCreateSpy: jest.SpiedFunction<typeof JobsOutboxRepository.prototype.create>;

    beforeEach(() => {
      outboxCreateSpy = jest
        .spyOn(JobsOutboxRepository.prototype, 'create')
        .mockImplementation(() => Promise.resolve({} as never));
    });

    afterEach(() => {
      outboxCreateSpy.mockRestore();
    });

    it('should create a fallback job in outbox when an unexpected DB error occurs on createEvent', async () => {
      const dto = createBaseDto({
        title: 'Failing Event',
        description: 'Description',
        awardedImpactScore: 10,
        maxParticipants: 50,
        idempotencyKey: 'failing-key',
      });

      const expectedEventId = uuidv5(`${mockUser.id}:${dto.idempotencyKey}`, TEST_EVENT_NAMESPACE);
      const spyGetRepo = jest.spyOn(mockDataSource, 'getRepository');
      const mockError = new Error('Unexpected DB Error');

      jest.spyOn(eventService, 'create').mockRejectedValue(mockError);

      await expect(controller.createEvent(dto, mockUser)).rejects.toThrow(PartialContentError);

      expect(spyGetRepo).toHaveBeenCalledWith(JobsOutboxModel);
      expect(outboxCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: JobMessagingType.FALLBACK_CREATE_EVENT,
          emitter: 'ms-event',
          emitterId: mockUser.id,
        }),
      );
      const lastCall = outboxCreateSpy.mock.calls[0]?.[0] as
        | {
            payload?: {
              userId?: string;
              eventId?: string;
              payload?: CreateEventCommandDTO;
            };
          }
        | undefined;
      expect(lastCall?.payload?.userId).toBe(mockUser.id);
      expect(lastCall?.payload?.eventId).toBe(expectedEventId);
      expect(lastCall?.payload?.payload).toEqual(dto);
    });

    it('should NOT create a fallback job when the actor is forbidden (403)', async () => {
      jest
        .spyOn(eventService, 'delete')
        .mockRejectedValue(new ForbiddenError('You are not the organizer of this event'));

      await expect(controller.deleteEvent({ id: 'event-123' }, mockUser)).rejects.toThrow(
        'You are not the organizer of this event',
      );

      expect(outboxCreateSpy).not.toHaveBeenCalled();
    });

    it('should NOT create a fallback job for Api Errors like 404', async () => {
      jest.spyOn(eventService, 'delete').mockRejectedValue(new NotFoundError('Event not found'));

      await expect(controller.deleteEvent({ id: 'event-123' }, mockUser)).rejects.toThrow(
        'Event not found',
      );

      expect(outboxCreateSpy).not.toHaveBeenCalled();
    });
  });
});
