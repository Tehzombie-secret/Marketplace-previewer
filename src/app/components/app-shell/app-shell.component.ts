import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'wb-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
  ],
})
export class AppShellComponent {

  constructor(
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
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
