import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShellComponent } from './components/app-shell/app-shell.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
  ]
})
export class AppComponent {
}
