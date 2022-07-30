import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { ToolbarService } from '../../services/toolbar/toolbar.service';

@Component({
  standalone: true,
  selector: 'wb-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule,
  ],
})
export class AppShellComponent {

  readonly toolbarState$ = this.toolbar.getStateChanges();

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
}
