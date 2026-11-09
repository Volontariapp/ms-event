import { registerDecorator } from 'class-validator';
import type { ValidationOptions } from 'class-validator';

// Same pattern as class-validator IsUUID('all') (validator.js isUUID 'all': versions 1 to 8,
// RFC variant, nil and max UUIDs, case insensitive). Compiled once, no global flag so test()
// carries no lastIndex state.
const UUID_ALL =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

export const IS_UUID_LIST = 'isUuid';

export const isUuidList = (value: unknown): boolean => {
  if (!Array.isArray(value)) {
    return false;
  }
  const items: readonly unknown[] = value;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item !== 'string' || !UUID_ALL.test(item)) {
      return false;
    }
  }
  return true;
};

/**
 * Validates a whole list of identifiers in one pass with a single precompiled expression,
 * instead of one IsUUID('all', { each: true }) constraint run per item. Same acceptance rule,
 * same constraint name and same message as IsUUID in each mode. Combine with IsArray and
 * ArrayMaxSize for the type and size limits.
 */
export function IsUUIDList(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      name: IS_UUID_LIST,
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate: isUuidList,
        defaultMessage: (args) => `each value in ${args?.property ?? ''} must be a UUID`,
      },
    });
  };
}
