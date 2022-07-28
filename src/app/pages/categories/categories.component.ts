import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Categories } from '../../models/categories/categories.interface';
import { Category } from '../../models/categories/category.interface';
import { APIService } from '../../services/api/api.service';
import { CategoryViewModel } from './models/category-view-model.interface';
import { CategoryListComponent } from './views/category-list/category-list.component';

@Component({
  standalone: true,
  selector: 'wb-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    CategoryListComponent,
  ],
})
export class CategoriesComponent {

  readonly items$ = this.getCategoriesChanges();

  constructor(
    private API: APIService,
  ) {
  }

  private getCategoriesChanges(): Observable<CategoryViewModel[]> {
    return this.API.getCategoriesChanges()
      .pipe(
        map((items: Categories) => items.items.map((item: Category) => this.getViewModel(item))),
      );
  }

  private getViewModel(item: Category): CategoryViewModel {
    const viewModel: CategoryViewModel = {
      item,
      url: item.slug ? [`/${item.platform}`, 'category', `${item.slug}`] : null,
      expanded: false,
      children: item.children.map((child: Category) => this.getViewModel(child)),
    };

    return viewModel;
  }

}
