import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Inject, Input, Renderer2, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { download } from '../../helpers/download';
import { openInNewTab } from '../../helpers/open-in-new-tab';
import { Photo } from '../../models/photo/photo.interface';
import { ReferenceType } from '../../models/photo/reference-type.enum';
import { ModalGalleryComponent } from '../modal-gallery/modal-gallery.component';
import { ImageOverlay } from './models/image-overlay.interface';

@Component({
  standalone: true,
  selector: '[wbImageOverlay]',
  templateUrl: './image-overlay.component.html',
  styleUrls: ['./image-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    ModalGalleryComponent,
  ],
})
export class ImageOverlayComponent<T extends ReferenceType, J extends ReferenceType> {

  @Input() wbImageOverlay?: ImageOverlay<T, J> | null = null;

  @HostBinding('class.ui-image-essentials') readonly bodyClass = true;
  @HostListener('click', ['$event']) processClick(event: Event): void { this.processElementClick(event); }
  @HostListener('dblclick') processDoubleClick(): void { this.openInNewTab(); }

  private get currentImage(): Photo | null {
    const currentSection = this.wbImageOverlay?.images?.[this.wbImageOverlay?.active?.[0] ?? 0];
    if (!currentSection) {

      return null;
    }

    return currentSection?.photos?.[this.wbImageOverlay?.active?.[1] ?? 0] ?? null;
  }

  constructor(
    private dialog: MatDialog,
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {
  }

  download(): void {
    const image = this.elementRef.nativeElement.querySelector('img');
    if (!image) {

      return;
    }
    download(image, this.currentImage?.name, this.renderer, this.document);
  }

  openInGallery(): void {
    if (!this.wbImageOverlay) {

      return;
    }
    this.dialog.open(ModalGalleryComponent, {
      ariaLabel: 'Галерея изображений',
      closeOnNavigation: true,
      data: this.wbImageOverlay,
    });
  }

  openInNewTab(): void {
    openInNewTab(this.currentImage?.big, this.document);
  }

  private processElementClick(event: Event): void {
    if (!this.wbImageOverlay?.hideOverlay) {

      return;
    }
    this.openInGallery();
    event.preventDefault();
  }

}
