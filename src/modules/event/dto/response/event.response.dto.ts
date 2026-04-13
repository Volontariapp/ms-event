import type {
  CreateEventResponse,
  UpdateEventResponse,
  ChangeEventStateResponse,
  ManageRequirementsResponse,
  GetEventResponse,
  SearchEventsResponse,
  ListRequirementsResponse,
  GetTagsResponse,
  CreateTagResponse,
  UpdateTagResponse,
  DeleteTagResponse,
  DeleteEventResponse,
} from '@volontariapp/contracts-nest';
import type { EventDTO } from '../common/event/event.dto.js';
import type { TagDTO, RequirementDTO } from '../common/common.dto.js';

export class CreateEventResponseDTO implements CreateEventResponse {
  event: EventDTO | undefined;
}

export class UpdateEventResponseDTO implements UpdateEventResponse {
  event: EventDTO | undefined;
}

export class ChangeEventStateResponseDTO implements ChangeEventStateResponse {
  event: EventDTO | undefined;
}

export class ManageRequirementsResponseDTO implements ManageRequirementsResponse {
  success!: boolean;
  message!: string;
}

export class DeleteEventResponseDTO implements DeleteEventResponse {
  success!: boolean;
}

export class GetEventResponseDTO implements GetEventResponse {
  event: EventDTO | undefined;
}

export class SearchEventsResponseDTO implements SearchEventsResponse {
  events!: EventDTO[];
  totalCount!: number;
}

export class ListRequirementsResponseDTO implements ListRequirementsResponse {
  requirements!: RequirementDTO[];
}

export class GetTagsResponseDTO implements GetTagsResponse {
  tags!: TagDTO[];
}

export class CreateTagResponseDTO implements CreateTagResponse {
  tag: TagDTO | undefined;
}

export class UpdateTagResponseDTO implements UpdateTagResponse {
  tag: TagDTO | undefined;
}

export class DeleteTagResponseDTO implements DeleteTagResponse {
  success!: boolean;
}
