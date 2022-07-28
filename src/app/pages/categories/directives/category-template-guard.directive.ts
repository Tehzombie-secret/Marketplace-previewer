import { Directive } from '@angular/core';
import { CategoryViewModel } from '../models/category-view-model.interface';

@Directive({
  standalone: true,
  selector: '[wbCategoryTemplateGuard]',
})
export class CategoryTemplateGuardDirective {

  static ngTemplateContextGuard(
    _dir: CategoryTemplateGuardDirective,
    _ctx: { $implicit: CategoryViewModel[], isRoot: boolean },
  ): _ctx is { $implicit: CategoryViewModel[], isRoot: boolean } {
    return true;
  }

}
