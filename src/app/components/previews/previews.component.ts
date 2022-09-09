import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { asyncScheduler } from 'rxjs';
import { Photo } from '../../models/photo/photo.interface';
import { PreviewChunk } from './models/previews-chunk.interface';

@Component({
  standalone: true,
  selector: 'ui-previews',
  templateUrl: './previews.component.html',
  styleUrls: ['./previews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
  ],
})
export class PreviewsComponent implements OnChanges, AfterViewInit {

  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement> | null = null;
  @ViewChildren('image') imagesRef: QueryList<ElementRef<HTMLElement>> | null = null;

  @Input() items?: PreviewChunk[] | null = null;
  @Input() sectionIndex = 0;
  @Input() photoIndex = 0;
  @Input() centered = false;
  @Input() vertical = false;
  @Output() readonly indexChange = new EventEmitter<[number, number]>();
  @Output() readonly openInsist = new EventEmitter<[number, number]>();

  lastClickedIndex: [number, number] = [this.sectionIndex, this.photoIndex];
  private viewInitiated = false;

  constructor(
    private elementRef: ElementRef,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const indexChanged = Boolean(changes['photoIndex'] || changes['sectionIndex']);
    const currentIndexIsNotClickedIndex = this.lastClickedIndex[0] !== this.sectionIndex || this.lastClickedIndex[1] !== this.photoIndex;
    const shouldScroll = indexChanged && currentIndexIsNotClickedIndex;
    if (shouldScroll) {
      this.scrollToElement();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => { // NgFor doesn't work instantly
      this.viewInitiated = true;
      this.scrollToElement();
    }, 600);
  }

  trackByChunk(_index: number, item: PreviewChunk): string {
    return item.id;
  }

  trackByPhoto(_index: number, item: Photo): string | null {
    return item.big ?? item.small ?? item.name ?? null;
  }

  emitChange(sectionIndex: number, photoIndex: number): void {
    this.lastClickedIndex = [sectionIndex, photoIndex];
    this.indexChange.emit(this.lastClickedIndex);
  }

  emitOpenUrge(): void {
    this.openInsist.next(this.lastClickedIndex);
  }

  private scrollToElement(): void {
    if (!this.viewInitiated) {

      return;
    }
    let imageIndex = 0;
    let sectionIndex = 0;
    while (sectionIndex <= this.sectionIndex && sectionIndex <= (this.items?.length ?? 0) - 1) {
      imageIndex += sectionIndex === this.sectionIndex
        ? this.photoIndex
        : this.items?.[sectionIndex]?.photos?.length ?? 0;
      sectionIndex++;
    }
    asyncScheduler.schedule(() => { // W/o scheduler, keyboard gallery navigation won't work
      // We don't use scrollIntoView since it centers position on every scroll container in viewport,
      // but we need to modify only this component's scroll container
      const elRect = this.imagesRef?.get?.(imageIndex)?.nativeElement?.getBoundingClientRect?.();
      const container = this.elementRef?.nativeElement;
      const containerRect = container?.getBoundingClientRect?.();
      if (!containerRect?.width || !elRect?.width) {

        return;
      }
      const opts: ScrollToOptions = {
        behavior: 'smooth',
        left: this.vertical ? undefined : (elRect?.x ?? 0) - (container?.clientWidth ?? 0) / 2 + (elRect?.width ?? 0) / 2,
        top: this.vertical ? (elRect?.y ?? 0) - (container?.clientHeight ?? 0) / 2 : undefined,
      };
      if (!opts.left && !opts.top) {

        return;
      }
      this.scrollContainer?.nativeElement?.scrollBy?.(opts);
    });
  }
}
