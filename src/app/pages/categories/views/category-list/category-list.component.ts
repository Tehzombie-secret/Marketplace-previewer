import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CategoryTemplateGuardDirective } from '../../directives/category-template-guard.directive';
import { CategoryViewModel } from '../../models/category-view-model.interface';

@Component({
  standalone: true,
  selector: 'wb-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgForOf,
    NgTemplateOutlet,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CategoryTemplateGuardDirective,
  ],
})
export class CategoryListComponent {

  @Input() items: CategoryViewModel[] | null = null;

  trackByFn(_index: number, item: CategoryViewModel): string | number | null {
    return item?.item?.slug ?? item.item.title;
  }

  toggleExpansion(item: CategoryViewModel): void {
    item.expanded = !item.expanded;
  }

}
