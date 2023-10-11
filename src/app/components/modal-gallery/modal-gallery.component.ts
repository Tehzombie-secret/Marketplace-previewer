import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { asyncScheduler, BehaviorSubject, map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { ROUTE_PATH } from '../../constants/route-path.const';
import { download } from '../../helpers/download';
import { getNextId } from '../../helpers/get-next-id';
import { getProductName } from '../../helpers/get-product-name';
import { openInNewTab } from '../../helpers/open-in-new-tab';
import { truthy } from '../../helpers/truthy';
import { AsyncFeedback } from '../../models/feedbacks/async-feedback.interface';
import { Feedback } from '../../models/feedbacks/feedback.interface';
import { ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { UserFeedback } from '../../models/feedbacks/user-feedback.interface';
import { Person } from '../../models/person/person.interface';
import { ReferenceType } from '../../models/photo/reference-type.enum';
import { FriendlyDatePipe } from '../../pipes/friendly-date.pipe';
import { PluralPipe } from '../../pipes/plural.pipe';
import { APIService } from '../../services/api/api.service';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { HistoryService } from '../../services/history/history.service';
import { VisitedEntryType } from '../../services/history/models/visited-entry-type.enum';
import { VisitedEntry } from '../../services/history/models/visited-entry.interface';
import { PreviewsComponent } from '../previews/previews.component';
import { ModalGalleryCurrentEntry } from './models/modal-gallery-current-entry.interface';
import { ModalGalleryReferenceStrategy } from './models/modal-gallery-reference-strategy.type';
import { ModalGalleryReference } from './models/modal-gallery-reference.interface';
import { ModalGallerySection } from './models/modal-gallery-section.interface';
import { ModalGallery } from './models/modal-gallery.interface';

@Component({
  standalone: true,
  selector: 'ui-modal-gallery',
  templateUrl: './modal-gallery.component.html',
  styleUrls: ['./modal-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    PreviewsComponent,
    PluralPipe,
    FriendlyDatePipe,
    RouterLink,
  ],
})
export class ModalGalleryComponent<T extends ReferenceType, J extends ReferenceType> {

  @ViewChild('canvas') canvasRef: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('image') imageRef: ElementRef<HTMLImageElement> | null = null;

  @HostListener('window:keydown', ['$event']) processKeydown(event: KeyboardEvent): void {
    const key = event.key.toLocaleLowerCase();
    this.processKey(key);
  }

  readonly photosPerFeedbackReference = 8;
  readonly images = this.data.images || [];
  readonly previews = this.images.map((item: ModalGallerySection<T>) => ({
    photos: item.photos,
    id: `${item.reference?.item?.id ?? getNextId()}`
  }));
  readonly imagesLength = this.images.reduce((acc: number, item: ModalGallerySection<T>) => acc + item.photos.length, 0);
  readonly currentPhoto$ = new BehaviorSubject<ModalGalleryCurrentEntry<T> | null>({
    platform: this.data.source?.item?.platform ?? APIPlatform.WB,
    sectionIndex: this.data.active[0] ?? 0,
    photoIndex: this.data.active[1] ?? 0,
    globalIndex: this.calculateGlobalIndex(this.data.active[0] ?? 0, this.data.active[1] ?? 0),
    photo: this.images[this.data.active[0]]?.photos?.[this.data.active[1]],
    section: this.images[this.data.active[0]],
  });
  readonly reference$ = this.getReferenceChanges(this.currentPhoto$);
  readonly feedbacks$ = this.getFeedbackChanges(this.currentPhoto$);
  readonly visitedEntry$ = this.getVisitedChanges(this.currentPhoto$);
  loadingImage = false;
  hasError = false;
  private imageToRotationMap = new Map<string, number>();
  /**
   * Hint to canvas whether we should clear context on image change,
   * or we can swap images instantly
   */
  private shouldClear = false;

  constructor(
    private API: APIService,
    private renderer: Renderer2,
    private history: HistoryService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DIALOG_DATA) private data: ModalGallery<T, J>,
  ) {
  }

  selectPhoto(photoIndex: number): void {
    let sectionIndex = this.currentPhoto$.getValue()?.sectionIndex ?? 0;
    if (photoIndex < 0) {
      sectionIndex = sectionIndex - 1 < 0
        ? this.images.length - 1
        : sectionIndex - 1;
      photoIndex = (this.images[sectionIndex]?.photos?.length ?? 1) - 1;
    }
    if (photoIndex > (this.images[sectionIndex]?.photos?.length ?? 0) - 1) {
      sectionIndex = sectionIndex + 1 > this.images.length - 1
        ? 0
        : sectionIndex + 1;
      photoIndex = 0;
    }
    this.selectSection(sectionIndex, photoIndex);
  }

  selectSection(sectionIndex: number, photoIndex: number): void {
    const newEntry: ModalGalleryCurrentEntry<T> = {
      platform: this.data.source?.item?.platform ?? APIPlatform.WB,
      photoIndex,
      sectionIndex,
      globalIndex: this.calculateGlobalIndex(sectionIndex, photoIndex),
      photo: this.images[sectionIndex].photos[photoIndex],
      section: this.images[sectionIndex],
    };
    const oldEntry = this.currentPhoto$.getValue();
    if (newEntry.globalIndex === oldEntry?.globalIndex) {

      return;
    }
    this.currentPhoto$.next(newEntry);
    this.shouldClear = true;
    this.hasError = false;
    setTimeout(() => {
      if (this.shouldClear) {
        this.clearCanvas();
        if (!this.hasError) {
          this.loadingImage = true;
        }
        this.cdr.markForCheck();
      }
    }, 100);
  }

  prev(): void {
    this.selectPhoto((this.currentPhoto$.getValue()?.photoIndex ?? 0) - 1);
  }

  next(): void {
    this.selectPhoto((this.currentPhoto$.getValue()?.photoIndex ?? 0) + 1);
  }

  clearCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {

      return;
    }
    const context = canvas.getContext('2d');
    context?.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2); // Compensates rotation
  }

  rotate(): void {
    const photo = this.currentPhoto$.getValue()?.photo?.big;
    if (!photo) {

      return;
    }
    const rotation = (this.imageToRotationMap.get(photo) ?? 0) + 1;
    if (rotation >= 4) {
      this.imageToRotationMap.delete(photo);
    } else {
      this.imageToRotationMap.set(photo, rotation);
    }
    this.drawImage();
  }

  download(): false {
    const photo = this.currentPhoto$.getValue()?.photo?.big;
    if (!photo) {

      return false;
    }
    download(
      this.imageRef?.nativeElement,
      this.currentPhoto$.getValue()?.photo?.name,
      this.renderer,
      this.document,
      this.imageToRotationMap.get(photo) ?? 0,
    );

    return false;
  }

  openInNewTab(): void {
    openInNewTab(this.currentPhoto$.getValue()?.photo?.big, this.document);
  }

  drawImage(event?: any): void {
    this.shouldClear = false;
    this.loadingImage = false;
    this.clearCanvas();
    const photo = this.currentPhoto$.getValue()?.photo?.big;
    const image = this.imageRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!photo || !image || !canvas) {

      return;
    }
    const rotation = (this.imageToRotationMap.get(photo) ?? 0) * 90 * Math.PI / 180;
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context?.translate(canvas.width / 2, canvas.height / 2);
    if (rotation) {
      context?.rotate(rotation);
    }
    const ratio = image.width / image.height;
    let newWidth = canvas.width;
    let newHeight = newWidth / ratio;
    if (newHeight > canvas.height) {
      newHeight = canvas.height;
      newWidth = newHeight * ratio;
    }
    context?.drawImage(image, -canvas.width / 2, -canvas.height / 2, newWidth, newHeight);
  }

  showError(): void {
    this.hasError = true;
    this.loadingImage = false;
  }

  retry(): void {
    const currentEntry = this.currentPhoto$.getValue();
    if (currentEntry) {
      this.currentPhoto$.next(null);
      asyncScheduler.schedule(() => {
        this.selectSection(currentEntry.sectionIndex, currentEntry.photoIndex);
      });
    }
  }

  private processKey(key: string): void {
    if (['arrowright', 'arrowdown'].includes(key)) {
      this.next();
    } else if (['arrowleft', 'arrowup'].includes(key)) {
      this.prev();
    } else if (key === 'd') {
      this.download();
    } else if (key === 'o') {
      this.openInNewTab();
    } else if (key === 'r') {
      this.rotate();
    }
  }

  private getReferenceChanges(photo$: Observable<ModalGalleryCurrentEntry<T> | null>): Observable<ModalGalleryReference | null> {
    const typeToReferenceStrategy: ModalGalleryReferenceStrategy<ModalGalleryReference> = {
      [ReferenceType.PERSON]: (item: ModalGalleryCurrentEntry<ReferenceType.PERSON>) => ({
        path: `/${item.platform}/${ROUTE_PATH.PERSON}/${item.section.reference?.item?.id || item.section.reference?.item?.wId}`,
        params: { global: `${Boolean(item.section.reference?.item?.id)}` },
        photo: item.section.reference?.item?.photo ?? null,
        title: item.section.reference?.item?.name ?? null,
      }),
      [ReferenceType.PRODUCT]: (item: ModalGalleryCurrentEntry<ReferenceType.PRODUCT>) => ({
        path: `/${item.platform}/${ROUTE_PATH.PRODUCT}/${item.section.reference?.item?.id}`,
        photo: item.section.reference?.item?.thumbnail ?? null,
        title: getProductName(item.section.reference?.item),
      }),
    };

    return photo$
      .pipe(
        map((item: ModalGalleryCurrentEntry<T> | null) => {
          return item?.section?.reference
            ? typeToReferenceStrategy[item.section.reference?.type ?? ReferenceType.PRODUCT as T]?.(item) ?? null
            : null;
        }),
      );
  }

  private getFeedbackChanges(photo$: Observable<ModalGalleryCurrentEntry<T> | null>): Observable<AsyncFeedback | null> {
    const referenceToFeedbacksStrategy: ModalGalleryReferenceStrategy<Observable<AsyncFeedback>> = {
      [ReferenceType.PERSON]: (item: ModalGalleryCurrentEntry<ReferenceType.PERSON>) => {
        const id = item.section.reference?.item?.id;
        const wId = item.section.reference?.item?.wId;
        return this.API.getUserChanges(id || wId, { useGlobalId: Boolean(id) })
          .pipe(
            map((person: Partial<Person>) => {
              const isHidden = !(person.feedbacks || []).some((feedback: Partial<UserFeedback>) => feedback.text === item.section.author?.quote);
              const asyncFeedback: AsyncFeedback = {
                isLoading: false,
                amount: (person.feedbacks || []).filter((feedback: Partial<UserFeedback>) => feedback.text !== item.section.author?.quote).length,
                isHidden,
                photos: (person.feedbacks || [])
                  .filter((feedback: Partial<UserFeedback>) => feedback.text !== item.section.author?.quote)
                  .map((feedback: Partial<UserFeedback>) => feedback.photos?.[0]?.small || null)
                  .filter(truthy),
              };

              return asyncFeedback;
            }),
            startWith({ isLoading: true, amount: 0, photos: [] }), // It's null while it's loading
          );
      },
      [ReferenceType.PRODUCT]: (item: ModalGalleryCurrentEntry<ReferenceType.PRODUCT>) =>
        this.API.getFeedbacksChanges(
          item.section.reference?.item,
          (items: ProductFeedbacks) => {
            const feedbacks = (items.feedbacks || []).filter((feedback: Partial<Feedback>) => feedback.photo?.length ?? 0 > 0);

            return feedbacks.length < this.photosPerFeedbackReference;
          },
        )
          .pipe(
            map((feedbacks: ProductFeedbacks | null) => ({
              isLoading: false,
              amount: (feedbacks?.withPhotosSize ?? 1) - 1,
              photos: (feedbacks?.feedbacks || [])
                .filter((feedback: Partial<Feedback>) => feedback.feedback !== item.section.author?.quote)
                .map((feedback: Partial<Feedback>) => feedback.feedbackPhotos?.[0]?.small || null)
                .filter(truthy),
            })),
            startWith({ isLoading: true, amount: 0, photos: [] }), // It's null while it's loading
          ),
    };

    return photo$
      .pipe(
        switchMap((item: ModalGalleryCurrentEntry<T> | null) => {
          if (!item?.section?.reference) {

            return of(null);
          }
          const callback: (item: ModalGalleryCurrentEntry<T>) => Observable<AsyncFeedback> =
            referenceToFeedbacksStrategy[item.section.reference.type ?? ReferenceType.PRODUCT as T];
          if (!callback) {

            return of(null);
          }

          return callback(item);
        }),
        shareReplay(1),
      );
  }

  private getVisitedChanges(entry$: Observable<ModalGalleryCurrentEntry<T> | null>): Observable<VisitedEntry | null> {
    const typeToTypeStrategy: Record<ReferenceType, VisitedEntryType> = {
      [ReferenceType.PERSON]: VisitedEntryType.PERSON,
      [ReferenceType.PRODUCT]: VisitedEntryType.PRODUCT,
    };
    const typeToIdStrategy: ModalGalleryReferenceStrategy<number | string | null | undefined> = {
      [ReferenceType.PERSON]: (item: ModalGalleryCurrentEntry<ReferenceType.PERSON>) => item?.section?.reference?.item?.id,
      [ReferenceType.PRODUCT]: (item: ModalGalleryCurrentEntry<ReferenceType.PRODUCT>) => item?.section?.reference?.item?.parentId,
    };

    return entry$
      .pipe(
        switchMap((entry: ModalGalleryCurrentEntry<T> | null) => {
          const referenceType = entry?.section?.reference?.type ?? ReferenceType.PRODUCT as T;
          const visitedType = typeToTypeStrategy[referenceType];
          const platform = entry?.section?.reference?.item?.platform ?? APIPlatform.WB;

          return entry?.section?.reference
            ? this.history.hasVisitedChanges(visitedType, platform, typeToIdStrategy[referenceType]?.(entry))
            : of(null);
        }),
      );
  }

  private calculateGlobalIndex(sectionIndex: number, photoIndex: number): number {
    let globalIndex = 0;
    let i = 0;
    while (i <= sectionIndex && i <= this.images.length - 1) {
      globalIndex += i === sectionIndex
        ? photoIndex
        : this.images[i].photos.length;
      i++;
    }

    return globalIndex;
  }
}
