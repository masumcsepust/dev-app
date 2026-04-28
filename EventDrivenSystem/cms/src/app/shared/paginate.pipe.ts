import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'paginate', standalone: true, pure: false })
export class PaginatePipe implements PipeTransform {
  transform(items: any[], page: number, pageSize: number): any[] {
    if (!items) return [];
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }
}
