import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, filter, of, Subscription, switchMap, tap } from 'rxjs';
import { ModalGalleryComponent } from '../../components/modal-gallery/modal-gallery.component';
import { ModalGallerySection } from '../../components/modal-gallery/models/modal-gallery-section.interface';
import { ModalGallery } from '../../components/modal-gallery/models/modal-gallery.interface';
import { download } from '../../helpers/download';
import { UserFeedback } from '../../models/feedbacks/user-feedback.interface';
import { Photo } from '../../models/photo/photo.interface';
import { ReferenceType } from '../../models/photo/reference-type.enum';
import { APIService } from '../../services/api/api.service';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { ToolbarService } from '../../services/toolbar/toolbar.service';

@Component({
  standalone: true,
  selector: 'app-feedback-search',
  templateUrl: './feedback-search.component.html',
  styleUrls: ['./feedback-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class FeedbackSearchComponent implements OnInit, OnDestroy {

  isLoading = false;
  canShowMore = true;
  hasError = false;
  readonly form = new FormGroup({
    search: new FormControl('', [Validators.minLength(3)]),
  });
  readonly page$ = new BehaviorSubject<number>(1);
  readonly items$ = new BehaviorSubject<Partial<UserFeedback>[]>([]);
  private readonly subscriptions$ = new Subscription();
  private readonly value$ = new BehaviorSubject<string>('');
  private readonly retry$ = new BehaviorSubject<void>(void 0);

  constructor(
    private toolbar: ToolbarService,
    private title: Title,
    private API: APIService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {
  }

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap.get('query');
    if (query) {
      this.form.patchValue({
        search: query,
      });
      this.value$.next(query);
    }
    this.toolbar.setTitle('Поиск');
    this.title.setTitle('Поиск');
    this.listenSearchChanges();
  }

  ngOnDestroy(): void {
    console.log('destroy');
    this.subscriptions$.unsubscribe();
  }

  trackById(index: number, feedback: Partial<UserFeedback>): string {
    return `${feedback.productId}~~~${feedback.userId || feedback.userWId}~~~${feedback.date}`;
  }

  submit(): void {
    if (this.form.invalid || this.isLoading) {
      return;
    }
    this.canShowMore = true;
    this.items$.next([]);
    this.page$.next(1);
    const query = this.form.value.search || '';
    this.value$.next(query);
    this.router.navigate(['/fsearch'], { queryParams: { query }, replaceUrl: true });
  }

  showMore(): void {
    this.page$.next(this.page$.value + 1);
  }

  openGallery(event: Event, feedback: Partial<UserFeedback>, activeFeedback: number, activePhoto: number): void {
    event.preventDefault();
    const gallery: ModalGallery<ReferenceType.PERSON, ReferenceType.PRODUCT> = {
      active: [activeFeedback, activePhoto],
      source: {
        type: ReferenceType.PRODUCT,
        item: {
          platform: APIPlatform.WB,
          brand: feedback.productBrand,
          id: feedback.productId,
          parentId: feedback.parentProductId,
          thumbnail: feedback.productPhoto?.small,
          title: feedback.productName,
        },
      },
      images: this.items$.value.map((item: Partial<UserFeedback>) => {
        const result: ModalGallerySection<ReferenceType.PERSON> = {
          author: {
            date: item.date,
            name: item.name,
            photo: '',
            quote: item.text,
          },
          photos: item.photos ?? [],
          reference: {
            type: ReferenceType.PERSON,
            item: {
              platform: APIPlatform.WB,
              photo: '',
              id: item.userId,
              wId: item.userWId,
              name: item.name,
            },
          },
        };
        return result;
      }),
    };
    this.dialog.open(ModalGalleryComponent, {
      ariaLabel: 'Галерея изображений',
      closeOnNavigation: true,
      data: gallery,
    });
  }

  download(photo: Photo): false {
    new Promise(async () => {
      if (!photo.big) {

        return;
      }
      const image = await this.createImage(photo.big);
      download(
        image,
        photo?.name,
        this.renderer,
        this.document,
        0,
      );
    })

    return false;
  }

  retry(): void {
    this.retry$.next();
  }

  private createImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve: (iamge: HTMLImageElement) => void) => {
      const image: HTMLImageElement = new Image();
      image.src = src;
      image.onload = () => resolve(image);
    });
  }

  private listenSearchChanges(): void {
    const searchSubscription$ = this.retry$
      .pipe(
        switchMap(() => combineLatest([this.page$, this.value$])),
        filter(([page, query]: [number, string]) => query.length > 3),
      )
      .subscribe(([page, query]: [number, string]) => {
        this.fetch(query, page);
      });
    this.subscriptions$.add(searchSubscription$);
  }

  private fetch(query: string, page: number): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    const fetchSubscription$ = this.API.getFeedbackSearchChanges(query, page)
      .subscribe({
        next: (items: Partial<UserFeedback>[]) => {
          if (items.length < 50) {
            this.canShowMore = false;
          }
          this.hasError = false;
          this.isLoading = false;
          this.cdr.markForCheck();
          this.items$.next([...this.items$.value, ...items]);
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
    this.subscriptions$.add(fetchSubscription$);
  }
}
