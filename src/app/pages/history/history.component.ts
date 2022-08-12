import { AsyncPipe, DOCUMENT, Location, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { SCROLL_CONTAINER_CLASS } from '../../constants/scroll-container-class.const';
import { fromQueryString } from '../../helpers/from-query-string';
import { toQueryString } from '../../helpers/to-query-string';
import { FriendlyDatePipe } from '../../pipes/friendly-date.pipe';
import { HistoryService } from '../../services/history/history.service';
import { HistoryEntry } from '../../services/history/models/history-entry.interface';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
import { VisitedEntryLabelPipe } from './pipes/visited-entry-label.pipe';
import { VisitedEntryLinkPipe } from './pipes/visited-entry-link.pipe';

@Component({
  standalone: true,
  selector: 'wb-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgForOf,
    NgIf,
    AsyncPipe,
    RouterModule,
    VisitedEntryLinkPipe,
    VisitedEntryLabelPipe,
    FriendlyDatePipe,
    PaginatorComponent,
  ],
})
export class HistoryComponent {

  readonly page$ = new BehaviorSubject<number>(0);
  readonly items$ = this.getItemsChanges(this.page$);
  readonly totalPages$ = this.getTotalPagesChanges();
  private readonly pageQueryParam = 'page';
  private itemsPerPage = 50;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private history: HistoryService,
    private toolbar: ToolbarService,
    private title: Title,
    @Inject(DOCUMENT) private document: Document,
  ) {
  }

  ngOnInit(): void {
    this.toolbar.setPlatform(null);
    this.toolbar.setTitle('История');
    this.title.setTitle('История');
    const page = +(this.route.snapshot.queryParamMap.get(this.pageQueryParam) ?? '1');
    if (page > 1) {
      this.page$.next(page - 1);
    }
  }

  trackByEntry(index: number, item: HistoryEntry): number {
    return item.date;
  }

  setPage(page: number): void {
    if (this.page$.getValue() === page) {

      return;
    }
    this.page$.next(page);
    const url = this.location.path(false);
    const [path, queryString] = url.split('?') ?? [];
    const params = {
      ...fromQueryString(queryString),
      page: page <= 0 ? undefined : page + 1
    };
    this.location.replaceState(path, toQueryString(params));
    this.document.querySelector(`.${SCROLL_CONTAINER_CLASS}`)?.scrollTo(0, 0);
  }

  private getItemsChanges(page$: Observable<number>): Observable<HistoryEntry[]> {
    return page$
      .pipe(
        switchMap((page: number) => this.history.getHistoryChanges(this.itemsPerPage, page * this.itemsPerPage)),
      );
  }

  private getTotalPagesChanges(): Observable<number> {
    return this.history.getHistoryLengthChanges()
      .pipe(
        map((length: number) => Math.ceil(length / this.itemsPerPage)),
      );
  }
}
