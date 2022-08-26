import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ToolbarService } from '../../services/toolbar/toolbar.service';

@Component({
  standalone: true,
  selector: 'wb-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [

  ],
})
export class FAQComponent implements OnInit {

  constructor(
    private title: Title,
    private toolbar: ToolbarService,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('FAQ');
    this.toolbar.setTitle('FAQ');
    this.toolbar.setPlatform(null);
  }
}
