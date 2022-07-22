import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { combineLatest, map, Observable, ReplaySubject, Subscription, switchMap } from 'rxjs';
import { filterTruthy } from '../../helpers/observables/filter-truthy';
import { Feedback } from '../../models/feedbacks/feedback.interface';
import { UserFeedback } from '../../models/feedbacks/user-feedback.interface';
import { Person } from '../../models/person/person.interface';
import { Photo } from '../../models/photo/photo.interface';
import { ReferenceType } from '../../models/photo/reference-type.enum';
import { Product } from '../../models/product/product.interface';
import { FriendlyDatePipe } from '../../pipes/friendly-date.pipe';
import { HistoryService } from '../../services/history/history.service';
import { VisitedEntryType } from '../../services/history/models/visited-entry-type.enum';
import { VisitedEntry } from '../../services/history/models/visited-entry.interface';
import { SettingsKey } from '../../services/settings/models/settings-key.enum';
import { SettingsService } from '../../services/settings/settings.service';
import { WBAPIService } from '../../services/wb-api/wb-api.service';
import { ImageOverlayComponent } from '../../ui/image-overlay/image-overlay.component';
import { ModalGallerySection } from '../../ui/modal-gallery/models/modal-gallery-section.interface';
import { BackTarget } from './models/back-target.interface';
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
    ImageOverlayComponent,
    FriendlyDatePipe,
  ],
})
export class PersonComponent implements OnInit, OnDestroy {

  readonly personId$ = this.getPersonIdChanges();
  readonly backTargetProductId$ = this.getBackTargetProductId();
  readonly backTarget$ = this.getBackTargetChanges(this.backTargetProductId$, this.personId$);
  readonly productName$ = this.getProductNameChanges(this.backTargetProductId$);
  readonly productPhoto$ = this.getProductPhotoChanges(this.backTargetProductId$);
  readonly person$ = this.getPersonChanges(this.personId$);
  private readonly visitDate$ = new ReplaySubject<Date>(1);
  readonly visitedEntry$ = this.getVisitedChanges(this.visitDate$, this.personId$);
  readonly galleryMode$ = this.settings.getChanges(SettingsKey.GALLERY_MODE);
  private readonly subscriptions$ = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private WBAPI: WBAPIService,
    private settings: SettingsService,
    private title: Title,
    private history: HistoryService,
  ) {
  }

  ngOnInit(): void {
    const effectsSubscription$ = this.person$.subscribe((person: Partial<PersonViewModel>) => {
      if (person.id) {
        const date = new Date();
        this.visitDate$.next(date);
        this.history.visit(VisitedEntryType.PERSON, date, person.id);
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

  private getPersonIdChanges(): Observable<string | null> {
    return this.activatedRoute.paramMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('id')),
      );
  }

  private getBackTargetProductId(): Observable<string | null> {
    return this.activatedRoute.queryParamMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('fromProduct')),
      );
  }

  private getBackTargetChanges(
    productId$: Observable<string | null>,
    personId$: Observable<string | null>,
  ): Observable<BackTarget | null> {
    return combineLatest([
      productId$,
      personId$,
    ])
      .pipe(
        map(([productId, personId]: (string | null)[]) => productId && personId
          ? { path: `/product/${productId}`, params: { fromPerson: personId } }
          : null
        ),
      )
  }

  private getProductNameChanges(productId$: Observable<string | null>): Observable<string> {
    return productId$
      .pipe(
        filterTruthy(),
        switchMap((id: string) => this.WBAPI.getProductChanges(id)),
        map((item: Partial<Product>) => item.title),
        filterTruthy(),
      );
  }


  private getProductPhotoChanges(productId$: Observable<string | null>): Observable<string | null> {
    return productId$
      .pipe(
        filterTruthy(),
        switchMap((id: string) => this.WBAPI.getProductChanges(id)),
        map((item: Partial<Product>) => item.images?.[0]?.small),
        filterTruthy(),
      );
  }

  private getPersonChanges(personId$: Observable<string | null>): Observable<Partial<PersonViewModel>> {
    return personId$
      .pipe(
        filterTruthy(),
        switchMap((id: string) => this.WBAPI.getUserChanges(id)),
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
                        hasGalleryButton: false,
                        hideOverlay: true,
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
      );
  }


  private getVisitedChanges(date$: Observable<Date>, id$: Observable<string | null>): Observable<VisitedEntry | null> {
    return combineLatest([
      id$.pipe(filterTruthy()),
      date$,
    ])
      .pipe(
        switchMap(([id, date]: [string, Date]) => this.history.hasVisitedChanges(VisitedEntryType.PERSON, id, date)),
      );
  }
}
