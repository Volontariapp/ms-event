import type {
  Event,
  GetUserCreatedEventsResponse,
  GetUserParticipatedEventsResponse,
  GetUserWishedEventsResponse,
  PaginationResponse,
} from '@volontariapp/contracts-nest';

abstract class UserEventsResponseBaseDTO {
  events!: Event[];
  totalCount!: number;
  pagination: PaginationResponse | undefined;
}

export class GetUserCreatedEventsResponseDTO
  extends UserEventsResponseBaseDTO
  implements GetUserCreatedEventsResponse {}

export class GetUserParticipatedEventsResponseDTO
  extends UserEventsResponseBaseDTO
  implements GetUserParticipatedEventsResponse {}

export class GetUserWishedEventsResponseDTO
  extends UserEventsResponseBaseDTO
  implements GetUserWishedEventsResponse {}
