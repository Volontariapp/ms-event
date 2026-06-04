import { BackendConfig, PostgresConfig, MSURLsConfig } from '@volontariapp/config';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

export class GeocodingConfig {
  @IsDefined()
  @Type(() => String)
  declare googleMapsApiKey: string;

  @IsDefined()
  @Type(() => String)
  declare osmUserAgent: string;
}

export class CustomConfig extends BackendConfig {
  @IsDefined()
  @Type(() => Number)
  declare port: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => MSURLsConfig)
  declare microServices: MSURLsConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => PostgresConfig)
  db!: PostgresConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => GeocodingConfig)
  declare geocoding: GeocodingConfig;
}
