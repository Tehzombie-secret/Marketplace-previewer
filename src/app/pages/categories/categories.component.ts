import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLinkWithHref } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ROUTE_PATH } from '../../constants/route-path.const';
import { Categories } from '../../models/categories/categories.interface';
import { Category } from '../../models/categories/category.interface';
import { APIService } from '../../services/api/api.service';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
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
    RouterLinkWithHref,
    MatIconModule,
    CategoryListComponent,
  ],
})
export class CategoriesComponent {

  readonly items$ = this.getCategoriesChanges();

  constructor(
    private API: APIService,
    private title: Title,
    private toolbar: ToolbarService,
  ) {
  }

  ngOnInit(): void {
    this.title.setTitle('Обзор категорий');
    this.toolbar.setTitle('Меню');
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
      url: item.slug ? [`/${item.platform}`, ROUTE_PATH.CATALOG, `${item.slug}`] : null,
      expanded: false,
      children: item.children.map((child: Category) => this.getViewModel(child)),
    };

    return viewModel;
  }

}
