import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ROUTE_PATH } from '../../constants/route-path.const';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { ToolbarService } from '../../services/toolbar/toolbar.service';

@Component({
  standalone: true,
  selector: 'wb-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
  ],
})
export class FAQComponent implements OnInit {

  readonly personPageLink = [`/${APIPlatform.WB}`, ROUTE_PATH.PERSON, '26399253'];
  readonly productPageLink = [`/${APIPlatform.WB}`, ROUTE_PATH.PRODUCT, '32396290'];

  constructor(
    private title: Title,
    private toolbar: ToolbarService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('FAQ');
    this.toolbar.setTitle('FAQ');
    this.toolbar.setPlatform(null);
  }
}
