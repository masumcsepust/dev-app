import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-bar" *ngIf="totalPages > 1">
      <span class="pg-info">{{ rangeStart }}–{{ rangeEnd }} of {{ total }}</span>
      <div class="pg-controls">
        <button class="pg-btn" [disabled]="page === 1" (click)="go(1)" title="First">«</button>
        <button class="pg-btn" [disabled]="page === 1" (click)="go(page - 1)" title="Previous">‹</button>
        <ng-container *ngFor="let p of pages">
          <span *ngIf="p === -1" class="pg-ellipsis">…</span>
          <button *ngIf="p !== -1" class="pg-btn" [class.active]="p === page" (click)="go(p)">{{ p }}</button>
        </ng-container>
        <button class="pg-btn" [disabled]="page === totalPages" (click)="go(page + 1)" title="Next">›</button>
        <button class="pg-btn" [disabled]="page === totalPages" (click)="go(totalPages)" title="Last">»</button>
      </div>
      <select class="pg-size" [value]="pageSize" (change)="onSizeChange($event)">
        <option *ngFor="let s of sizes" [value]="s">{{ s }} / page</option>
      </select>
    </div>
    <div class="pagination-bar simple" *ngIf="totalPages <= 1 && total > 0">
      <span class="pg-info">{{ total }} record{{ total === 1 ? '' : 's' }}</span>
    </div>
  `,
  styles: [`
    .pagination-bar {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .85rem 1rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-radius: 0 0 10px 10px;
      flex-wrap: wrap;
    }
    .pg-info { font-size: .78rem; color: #64748b; white-space: nowrap; }
    .pg-controls { display: flex; align-items: center; gap: .25rem; margin-left: auto; }
    .pg-btn {
      min-width: 32px; height: 32px;
      padding: 0 .5rem;
      border: 1px solid #e2e8f0;
      background: #fff;
      border-radius: 7px;
      font-size: .8rem;
      font-weight: 500;
      color: #475569;
      cursor: pointer;
      transition: all .15s;
      display: flex; align-items: center; justify-content: center;
    }
    .pg-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
    .pg-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; font-weight: 700; }
    .pg-btn:disabled { opacity: .35; cursor: not-allowed; }
    .pg-ellipsis { font-size: .8rem; color: #94a3b8; padding: 0 .25rem; }
    .pg-size {
      height: 32px; padding: 0 .5rem;
      border: 1px solid #e2e8f0; border-radius: 7px;
      font-size: .78rem; color: #475569;
      background: #fff; cursor: pointer; outline: none;
    }
    .pagination-bar.simple { justify-content: flex-end; }
  `]
})
export class PaginationComponent implements OnChanges {
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  sizes = [10, 20, 50];
  totalPages = 0;
  pages: number[] = [];
  rangeStart = 0;
  rangeEnd = 0;

  ngOnChanges() { this.calc(); }

  calc() {
    this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
    this.rangeStart = Math.min((this.page - 1) * this.pageSize + 1, this.total);
    this.rangeEnd = Math.min(this.page * this.pageSize, this.total);
    this.pages = this.buildPages();
  }

  buildPages(): number[] {
    const total = this.totalPages;
    const cur = this.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  go(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }

  onSizeChange(e: Event) {
    const size = +(e.target as HTMLSelectElement).value;
    this.pageSizeChange.emit(size);
    this.pageChange.emit(1);
  }
}
