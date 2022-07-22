import { NgModule } from '@angular/core';

import { TabsComponent } from './tabs.component';
import { TabHeaderComponent } from './views/tab-header.component';
import { TabComponent } from './views/tab.component';

@NgModule({
  imports: [
    TabsComponent,
    TabComponent,
    TabHeaderComponent,
  ],
  exports: [
    TabsComponent,
    TabComponent,
    TabHeaderComponent,
  ],
})
export class TabsModule {}
