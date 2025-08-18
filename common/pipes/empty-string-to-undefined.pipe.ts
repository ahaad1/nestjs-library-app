import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class EmptyStringToUndefinedPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    return this.cleanEmptyStrings(value);
  }

  private cleanEmptyStrings(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.cleanEmptyStrings(item));
    }

    if (value !== null && typeof value === 'object') {
      const result = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const cleanedValue = this.cleanEmptyStrings(value[key]);
          result[key] = cleanedValue;
        }
      }
      return result;
    }

    if (value === '') {
      return undefined;
    }

    return value;
  }
}
