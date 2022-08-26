import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterOutlet } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { ToolbarService } from '../../services/toolbar/toolbar.service';

@Component({
  standalone: true,
  selector: 'wb-platform-picker',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
  ],
})
export class PlatformPickerComponent implements OnInit, OnDestroy {

  private readonly subscription$ = new Subscription();

  constructor(
    private toolbar: ToolbarService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    const platformSubscription$ = this.route.paramMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('platform') as APIPlatform),
      )
      .subscribe((platform: APIPlatform | null) => this.toolbar.setPlatform(platform));
    this.subscription$.add(platformSubscription$);
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
}
