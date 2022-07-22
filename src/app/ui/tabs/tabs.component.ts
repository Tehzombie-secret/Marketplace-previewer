import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, EventEmitter, OnDestroy, Output, QueryList, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { TabHeaderComponent } from './views/tab-header.component';
import { TabComponent } from './views/tab.component';

@Component({
  standalone: true,
  exportAs: 'wbTabs',
  selector: 'wb-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    TabComponent,
    TabHeaderComponent,
  ],
})
export class TabsComponent implements AfterContentInit, OnDestroy {

  @ContentChildren(TabComponent) tabsRef: QueryList<TabComponent> | null = null;

  @Output() readonly tabChange = new EventEmitter<void>();

  activeTab: TabComponent | null = null;

  private tabIds: number[] = [];
  private subscriptions$ = new Subscription();

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngAfterContentInit(): void {
    const firstTab = this.tabsRef?.get?.(0);
    if (firstTab) {
      this.setActive(firstTab.id);
    }
    this.populateTabIdsCache();
    this.tabsRef?.changes?.subscribe?.(() => {
      this.restoreTab();
      this.populateTabIdsCache();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }

  setActive(id: number): void {
    const activeTab = this.tabsRef?.find((tab: TabComponent) => tab.id === id);
    if (!activeTab) {

      return;
    }
    this.activeTab = activeTab;
    (this.tabsRef || []).forEach((tab: TabComponent) => tab.setActive(tab.id === this.activeTab?.id));
    this.tabChange.emit();
  }

  private restoreTab(): void {
    const activeTab = this.tabsRef?.find((item: TabComponent) => item.id === this.activeTab?.id);
    if (activeTab) {
      // No need to restore tab

      return;
    }
    const activeTabId = this.activeTab?.id;
    if (activeTabId === undefined) {
      // This tab was out of this world, somehow

      return;
    }
    const prevActiveTabIndex = this.tabIds.indexOf(activeTabId);
    const newTabIndex = prevActiveTabIndex === (this.tabIds.length - 1)
      ? (this.tabsRef?.length ?? 1) - 1
      : prevActiveTabIndex;
    const newTabId = this.tabsRef?.get(newTabIndex)?.id;
    if (newTabId === undefined) {

      return;
    }
    this.setActive(newTabId);
  }

  private populateTabIdsCache(): void {
    this.tabIds = (this.tabsRef?.toArray?.() || []).map((tab: TabComponent) => tab.id);
  }
}
