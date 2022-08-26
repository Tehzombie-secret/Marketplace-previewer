import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLinkWithHref } from '@angular/router';
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
    RouterLinkWithHref,
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
      };

      return item;
    });
  }

}
