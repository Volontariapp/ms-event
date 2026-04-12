import type {
  GetEventQuery,
  ListRequirementsQuery,
  GetTagsQuery,
} from '@volontariapp/contracts-nest';

export class GetEventQueryDTO implements GetEventQuery {
  id!: string;
}

export class ListRequirementsQueryDTO implements ListRequirementsQuery {
  eventId!: string;
}

export class GetTagsQueryDTO implements GetTagsQuery {
  slugs!: string[];
}
