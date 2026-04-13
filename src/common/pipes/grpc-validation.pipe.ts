import {
  ArgumentMetadata,
  Injectable,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { EventState, EventType } from '@volontariapp/contracts-nest';

@Injectable()
export class GrpcValidationPipe extends ValidationPipe {
  private readonly logger = new Logger('GrpcValidationDebug');

  // Map des enums pour la conversion automatique
  private readonly enumMaps = {
    type: EventType,
    state: EventState,
  };

  constructor() {
    super({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    this.logger.debug(`--- incoming ${metadata.type} data ---`);

    // 1. Nettoyage des chaînes vides ET conversion des Enums/Strings
    const processedValue = this.processData(value);

    this.logger.debug(`--- processed data (ready for validation) ---`);
    this.logger.debug(JSON.stringify(processedValue, null, 2));

    try {
      return await super.transform(processedValue, metadata);
    } catch (error) {
      this.logger.error(`Validation failed for ${metadata.metatype?.name}`);
      // Log du détail de l'erreur pour voir quel champ bloque
      this.logger.error(JSON.stringify(error, null, 2));
      throw error;
    }
  }

  private processData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj === '' ? undefined : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((v) => this.processData(v));
    }

    return Object.keys(obj).reduce<any>((acc, key) => {
      let val = obj[key];

      // A. Nettoyage des chaînes vides
      if (val === '') {
        acc[key] = undefined;
        return acc;
      }

      // B. Conversion automatique des Strings de Timestamps en Numbers
      if ((key === 'seconds' || key === 'nanos') && typeof val === 'string') {
        acc[key] = Number(val);
        return acc;
      }

      // C. Conversion automatique des Enums (String -> Number)
      if (this.enumMaps[key as keyof typeof this.enumMaps]) {
        const enumObj = this.enumMaps[key as keyof typeof this.enumMaps];
        if (typeof val === 'string' && isNaN(Number(val))) {
          const mappedValue = enumObj[val as keyof typeof enumObj];
          val = typeof mappedValue === 'number' ? mappedValue : val;
        }
      }

      acc[key] = this.processData(val);
      return acc;
    }, {});
  }
}
