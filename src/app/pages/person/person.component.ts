import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { combineLatest, map, Observable, ReplaySubject, shareReplay, Subscription, switchMap } from 'rxjs';
import { ModalGalleryComponent } from '../../components/modal-gallery/modal-gallery.component';
import { ModalGallerySection } from '../../components/modal-gallery/models/modal-gallery-section.interface';
import { ModalGallery } from '../../components/modal-gallery/models/modal-gallery.interface';
import { ROUTE_PATH } from '../../constants/route-path.const';
import { filterTruthy } from '../../helpers/observables/filter-truthy';
import { UserFeedback } from '../../models/feedbacks/user-feedback.interface';
import { Person } from '../../models/person/person.interface';
import { Photo } from '../../models/photo/photo.interface';
import { ReferenceType } from '../../models/photo/reference-type.enum';
import { FriendlyDatePipe } from '../../pipes/friendly-date.pipe';
import { APIService } from '../../services/api/api.service';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { HistoryService } from '../../services/history/history.service';
import { VisitRequest } from '../../services/history/models/visit-request.interface';
import { VisitedEntryType } from '../../services/history/models/visited-entry-type.enum';
import { VisitedEntry } from '../../services/history/models/visited-entry.interface';
import { SettingsKey } from '../../services/settings/models/settings-key.enum';
import { SettingsService } from '../../services/settings/settings.service';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
import { PersonFeedbackViewModel } from './models/person-feedback-view-model.interface';
import { PersonPhotoViewModel } from './models/person-photo-view-model.interface';
import { PersonViewModel } from './models/person-view-model.interface';

@Component({
  standalone: true,
  selector: 'wb-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    FriendlyDatePipe,
    ModalGalleryComponent,
  ],
})
export class PersonComponent implements OnInit, OnDestroy {

  readonly person$ = this.getPersonChanges();
  private readonly visitDate$ = new ReplaySubject<Date>(1);
  readonly visitedEntry$ = this.getVisitedChanges(this.visitDate$, this.person$);
  readonly galleryMode$ = this.settings.getChanges(SettingsKey.GALLERY_MODE);
  readonly productPathPrefix = `/${ROUTE_PATH.PRODUCT}`;
  private readonly subscriptions$ = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private API: APIService,
    private settings: SettingsService,
    private title: Title,
    private history: HistoryService,
    private dialog: MatDialog,
    private toolbar: ToolbarService,
  ) {
  }

  ngOnInit(): void {
    this.toolbar.setTitle('Профиль');

    const effectsSubscription$ = this.person$.subscribe((person: Partial<PersonViewModel>) => {
      if (person.id) {
        const date = new Date();
        this.visitDate$.next(date);
        const entry: VisitRequest = {
          type: VisitedEntryType.PERSON,
          date,
          title: person.name,
          platform: person.platform ?? APIPlatform.WB,
          ids: [person.id],
          photo: person.photo,
        };
        this.history.visit(entry);
      }
      this.title.setTitle(person.name ?? 'Профиль');
    });
    this.subscriptions$.add(effectsSubscription$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }

  trackByFeedback(_index: number, item: Partial<PersonFeedbackViewModel>): string | number | null {
    return item.productId ?? item.text ?? null;
  }

  trackByPhoto(_index: number, item: PersonPhotoViewModel): string | null {
    return item.photo.name ?? item.photo.big ?? item.photo.small ?? null;
  }

  toggleGalleryMode(): void {
    this.settings.set(SettingsKey.GALLERY_MODE, !this.settings.get(SettingsKey.GALLERY_MODE));
  }

  openGallery(event: Event, gallery: ModalGallery<ReferenceType.PRODUCT, ReferenceType.PERSON>): void {
    event.preventDefault(),
    this.dialog.open(ModalGalleryComponent, {
      ariaLabel: 'Галерея изображений',
      closeOnNavigation: true,
      data: gallery,
    });
  }

  private getPersonChanges(): Observable<Partial<PersonViewModel>> {
    return this.activatedRoute.paramMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('id')),
        filterTruthy(),
        switchMap((id: string) => this.API.getUserChanges(id)),
        map((item: Partial<Person>) => {
          const images: ModalGallerySection<ReferenceType.PRODUCT>[] = (item.feedbacks || [])
            .filter((feedback: Partial<UserFeedback>) => (feedback.photos?.length ?? 0) > 0)
            .map((feedback: Partial<UserFeedback>) => {
              const gallery: ModalGallerySection<ReferenceType.PRODUCT> = {
                author: {
                  quote: feedback.text,
                  country: item.country,
                  date: feedback.date,
                  name: item.name,
                  photo: item.photo,
                },
                reference: {
                  type: ReferenceType.PRODUCT,
                  item: {
                    platform: item.platform,
                    id: feedback.productId,
                    parentId: feedback.parentProductId,
                    brand: feedback.productBrand,
                    title: feedback.productName,
                    thumbnail: feedback.productPhoto?.big ?? null,
                  },
                },
                photos: feedback.photos || [],
              };

              return gallery;
            });
          const viewModel: Partial<PersonViewModel> = {
            ...item,
            feedbackViewModels: (item.feedbacks || [])
              .filter((feedback: Partial<UserFeedback>) => (feedback.photos?.length ?? 0) > 0)
              .map((feedback: Partial<UserFeedback>, sectionIndex: number) => {
                const feedbackViewModel: PersonFeedbackViewModel = {
                  ...feedback,
                  photoViewModels: (feedback.photos || []).map((photo: Photo, photoIndex: number) => {
                    const photoViewModel: PersonPhotoViewModel = {
                      gallery: {
                        active: [sectionIndex, photoIndex],
                        source: {
                          type: ReferenceType.PERSON,
                          item,
                        },
                        images,
                      },
                      photo,
                    };

                    return photoViewModel;
                  }),
                };

                return feedbackViewModel;
              }),
          };

          return viewModel;
        }),
        shareReplay(1),
      );
  }

  private getVisitedChanges(date$: Observable<Date>, person$: Observable<Partial<PersonViewModel>>): Observable<VisitedEntry | null> {
    return combineLatest([
      date$,
      person$,
    ])
      .pipe(
        switchMap(([date, person]: [Date, Partial<PersonViewModel>]) =>
          this.history.hasVisitedChanges(VisitedEntryType.PERSON, person.platform ?? APIPlatform.WB, person.id, date)
        ),
      );
  }
}
