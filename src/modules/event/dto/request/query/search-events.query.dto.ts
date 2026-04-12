import type {
  SearchEventsQuery,
  EventType,
  GeoCircle,
} from '@volontariapp/contracts-nest';

export class SearchEventsQueryDTO implements SearchEventsQuery {
  area: GeoCircle | undefined;
  types!: EventType[];
  tagSlugs!: string[];
  onlyAvailable!: boolean;
  searchTerm!: string;
  organizerId!: string;
}
