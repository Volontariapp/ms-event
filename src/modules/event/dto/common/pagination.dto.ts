import { PaginationRequest } from '@volontariapp/contracts-nest';
import { IsInt, Max, Min } from 'class-validator';

// Plafond de limit accepte par ms-event. La gateway appelle certains ms avec limit 1000,
// ce plafond sera abaisse plus tard.
export const MAX_PAGINATION_LIMIT = 100;

export class PaginationRequestDTO implements PaginationRequest {
  @IsInt()
  @Min(1)
  page!: number;

  @IsInt()
  @Min(1)
  @Max(MAX_PAGINATION_LIMIT)
  limit!: number;
}
