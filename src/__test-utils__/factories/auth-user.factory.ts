import { randomUUID } from 'crypto';
import type { AuthUser } from '@volontariapp/auth';
import { UserRoles } from '@volontariapp/shared';

export class AuthUserFactory {
  static create(overrides?: Partial<AuthUser>): AuthUser {
    return {
      id: randomUUID(),
      role: UserRoles.VOLUNTEER,
      ...overrides,
    };
  }

  static admin(overrides?: Partial<AuthUser>): AuthUser {
    return AuthUserFactory.create({
      role: UserRoles.ADMIN,
      ...overrides,
    });
  }

  static organization(overrides?: Partial<AuthUser>): AuthUser {
    return AuthUserFactory.create({
      role: UserRoles.ORGANIZATION,
      ...overrides,
    });
  }
}
