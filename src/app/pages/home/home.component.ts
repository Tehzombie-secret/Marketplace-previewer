import { NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PLATFORM_TO_COLOR_STRATEGY } from '../../constants/platform-to-color-strategy.const';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
import { PlatformNavigation } from './models/platform-navigation.interface';

@Component({
  standalone: true,
  selector: 'wb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
  ],
})
export class HomeComponent implements OnInit {

  readonly items = this.getItems();

  constructor(
    private toolbar: ToolbarService,
    private title: Title,
  ) {
  }

  ngOnInit(): void {
    this.title.setTitle('Mkpl fdbck');
    this.toolbar.setPlatform(null);
    this.toolbar.setTitle('Главная');
  }

  trackByItem(_index: number, item: PlatformNavigation): string {
    return item.color;
  }

  private getItems(): PlatformNavigation[] {
    return Object.values(APIPlatform).map((platform: APIPlatform) => {
      const item: PlatformNavigation = {
        color: PLATFORM_TO_COLOR_STRATEGY[platform],
        url: [`/${platform}`],
        blocked: platform === APIPlatform.ETSY,
      };

      return item;
    });
  }

}
