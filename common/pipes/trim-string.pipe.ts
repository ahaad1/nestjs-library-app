import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringsPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    return this.trimStrings(value);
  }

  private trimStrings(obj: any): any {
    if (typeof obj === 'string') {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.trimStrings(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const trimmedObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          trimmedObj[key] = this.trimStrings(obj[key]);
        }
      }
      return trimmedObj;
    }

    return obj;
  }
}
