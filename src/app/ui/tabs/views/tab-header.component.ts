import { ChangeDetectionStrategy, Component, Directive, ElementRef, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  standalone: true,
  selector: 'wb-tab-header',
  template: '<ng-template><ng-content></ng-content></ng-template>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TabHeaderComponent {

  @ViewChild(TemplateRef, { static: true }) contentRef: TemplateRef<null> | null = null;

}
