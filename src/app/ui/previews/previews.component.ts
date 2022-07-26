import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChildren, ViewEncapsulation } from '@angular/core';
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

  @ViewChildren('image') imagesRef: QueryList<ElementRef<HTMLElement>> | null = null;

  @Input() items?: PreviewChunk[] | null = null;
  @Input() sectionIndex = 0;
  @Input() photoIndex = 0;
  @Input() centered = false;
  @Input() vertical = false;
  @Output() readonly indexChange = new EventEmitter<[number, number]>();
  @Output() readonly openInsist = new EventEmitter<[number, number]>();

  lastClickedIndex: [number, number] = [this.sectionIndex, this.photoIndex];

  ngOnChanges(changes: SimpleChanges): void {
    const indexChanged = Boolean(changes['photoIndex'] || changes['sectionIndex']);
    const currentIndexIsNotClickedIndex = this.lastClickedIndex[0] !== this.sectionIndex || this.lastClickedIndex[1] !== this.photoIndex;
    const shouldScroll = indexChanged && currentIndexIsNotClickedIndex;
    if (shouldScroll) {
      this.scrollToElement();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToElement();
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
    let imageIndex = 0;
    let sectionIndex = 0;
    while (sectionIndex <= this.sectionIndex && sectionIndex <= (this.items?.length ?? 0) - 1) {
      imageIndex += sectionIndex === this.sectionIndex
        ? this.photoIndex
        : this.items?.[sectionIndex]?.photos?.length ?? 0;
      sectionIndex++;
    }
    asyncScheduler.schedule(() => { // W/o scheduler, keyboard gallery navigation won't work
      this.imagesRef?.get?.(imageIndex)?.nativeElement?.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'center' });
    });
  }
}
