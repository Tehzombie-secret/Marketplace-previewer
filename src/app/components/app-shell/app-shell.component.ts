import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
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
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
  ],
})
export class AppShellComponent {

  readonly toolbarState$ = this.toolbar.getStateChanges();
  sidenavOpened = false;

  constructor(
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private toolbar: ToolbarService,
  ) {
    // Necessary to define in constructor, since any registry changes are not reactive
    this.iconRegistry.addSvgIconResolver((name: string) =>
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${environment.baseHref}assets/icons/${name}.svg`)
    );
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
