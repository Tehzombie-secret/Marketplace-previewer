import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, NgZone, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getNextId } from '../../../helpers/get-next-id';

import { TabHeaderComponent } from './tab-header.component';

@Component({
  standalone: true,
  exportAs: 'wbTab',
  selector: 'wb-tab',
  template: '<ng-template><ng-content></ng-content></ng-template>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TabComponent {

  @ContentChild(TabHeaderComponent, { static: false }) tabLabelRef: TabHeaderComponent | null = null;
  @ViewChild(TemplateRef, { static: true }) contentRef: TemplateRef<null> | null = null;

  readonly id = getNextId();
  readonly isActive$ = new BehaviorSubject<boolean>(false);
  isActive = false;

  setActive(isActive: boolean): void {
    this.isActive = isActive;
    this.isActive$.next(this.isActive);
  }

}

