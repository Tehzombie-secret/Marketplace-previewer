import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { truthy } from '../../helpers/truthy';
import { PaginatorButton } from './models/paginator-button.interface';

@Component({
  standalone: true,
  selector: 'wb-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgForOf,
    NgTemplateOutlet,
    MatIconModule,
    PaginatorComponent,
  ]
})
export class PaginatorComponent implements OnChanges {

  @Input() page: number | null = 1;
  @Input() total: number | null = 1;

  @Output() pageChange = new EventEmitter<number>();

  buttons: PaginatorButton[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const pageChanged = changes['page'] && changes['page']?.currentValue !== changes['page']?.previousValue;
    const quantityChanged = changes['total'] && changes['total']?.currentValue !== changes['total']?.previousValue;
    if (!pageChanged && !quantityChanged) {

      return;
    }
    console.log('rebuild row', this.page, this.total, changes);
    this.constructButtonRow(this.page, this.total);
  }

  trackByFn(_index: number, item: PaginatorButton): string {
    return `${item.label ?? item.page}-${item.isActive}`;
  }

  /**
   * Set paginator page and prevent navigation if button is an anchor element
   * @param page
   * @returns false - prevent navigation in case of anchor button
   */
  setPage(page: number | null): false {
    if (page === this.page || page === null) {

      return false;
    }
    this.constructButtonRow(page, this.total);
    this.pageChange.emit(this.page ?? 1);

    return false;
  }

  private constructButtonRow(page: number | null, total: number | null): void {
    if (page === null) {
      page = 1;
    }
    if (total !== null) {
      if (page > total) {
        page = total;
      } else if (page < 1) {
        page = 1;
      }
    }
    console.log('set page to', page);
    this.page = page;
    if (total !== null) {
      this.total = total;
      this.buttons = this.getButtonRow(page, total);
    }
  }

  private getButtonRow(current: number, total: number): PaginatorButton[] {
    // We're assuming that count starts from 1.
    // N +(-) 3(4) is an edge case: we should always show 5 pages.
    const buttons: PaginatorButton[] = [
      /** First page */ (current >= 4 && total > 5) ? { page: 1 } : null,
      /** ... */ (current >= 5 && total > 6) ? { page: null, label: '...' } : null,
      /* N - 4 */ (current === total && total > 4) ? { page: current - 4 } : null,
      /* N - 3 */ (current + 2 > total && current > 3) ? { page: current - 3 } : null,
      /* N - 2 */ current > 2 ? { page: current - 2 } : null,
      /* N - 1 */ current > 1 ? { page: current - 1 } : null,
      /* N */ { page: current, isActive: true },
      /* N + 1 */ (current + 1 <= total && total > 1) ? { page: current + 1 } : null,
      /* N + 2 */ (current + 2 <= total && total > 2) ? { page: current + 2 } : null,
      /* N + 3 */ (current + 3 <= total && current < 3) ? { page: current + 3 } : null,
      /* N + 4 */ (current + 4 <= total && current < 2) ? { page: current + 4 } : null,
      /** ... */ (total - current >= 4 && total > 6) ? { page: null, label: '...' } : null,
      /** Last page */ (total - current >= 3 && total > 5) ? { page: total } : null,
    ].filter(truthy);

    return buttons;
  }
}
