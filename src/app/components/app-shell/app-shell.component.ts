import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { Event, NavigationEnd, Router, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ROUTE_PATH } from '../../constants/route-path.const';
import { SCROLL_CONTAINER_CLASS } from '../../constants/scroll-container-class.const';
import { ToolbarService } from '../../services/toolbar/toolbar.service';

@Component({
  standalone: true,
  selector: 'wb-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    NgClass,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterOutlet,
    RouterLinkWithHref,
  ],
})
export class AppShellComponent {

  readonly historyPagePath = [`/${ROUTE_PATH.HISTORY}`];
  readonly FAQPagePath = [`/${ROUTE_PATH.FAQ}`];
  readonly toolbarState$ = this.toolbar.getStateChanges();
  readonly scrollContainerClass = SCROLL_CONTAINER_CLASS;
  sidenavOpened = false;

  constructor(
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private toolbar: ToolbarService,
    private router: Router,
  ) {
    // Necessary to define in constructor, since any registry changes are not reactive
    this.iconRegistry.addSvgIconResolver((name: string) =>
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${environment.baseHref}assets/icons/${name}.svg`)
    );
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event: Event) => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.sidenavOpened = false;
      });
  }

  trackByTab(_index: number, item: { index: number }): number {
    return item.index;
  }

  openSidenav(): void {
    this.sidenavOpened = true;
  }

  closeSidenav(): void {
    this.sidenavOpened = false;
  }
}
