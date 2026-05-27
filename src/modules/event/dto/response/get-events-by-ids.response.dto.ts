import type { GetEventsByIdsResponse, Event } from '@volontariapp/contracts-nest';

export class GetEventsByIdsResponseDTO implements GetEventsByIdsResponse {
  events!: Event[];
  totalCount!: number;
}
