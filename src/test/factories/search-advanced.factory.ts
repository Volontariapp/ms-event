import { SearchAdvancedVO } from '@volontariapp/domain-event';

export type SearchAdvancedFields = Partial<
  Pick<
    SearchAdvancedVO,
    | 'area'
    | 'types'
    | 'tagSlugs'
    | 'onlyAvailable'
    | 'searchTerm'
    | 'organizerId'
    | 'ids'
    | 'excludedIds'
    | 'startDateFrom'
    | 'startDateTo'
    | 'statuses'
    | 'page'
    | 'limit'
    | 'excludedOrganizerIds'
    | 'endAtFrom'
  >
>;

/** Builds a validated SearchAdvancedVO from named fields instead of 15 positional arguments. */
export const createSearchAdvancedVO = (fields: SearchAdvancedFields = {}): SearchAdvancedVO =>
  new SearchAdvancedVO(
    fields.area,
    fields.types,
    fields.tagSlugs,
    fields.onlyAvailable,
    fields.searchTerm,
    fields.organizerId,
    fields.ids,
    fields.excludedIds,
    fields.startDateFrom,
    fields.startDateTo,
    fields.statuses,
    fields.page,
    fields.limit,
    fields.excludedOrganizerIds,
    fields.endAtFrom,
  );
