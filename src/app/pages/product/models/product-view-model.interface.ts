import { HttpErrorResponse } from '@angular/common/http';
import { Product } from '../../../models/product/product.interface';

export interface ProductViewModel {
  isLoading: boolean;
  item?: Partial<Product>;
  error?: HttpErrorResponse;
  descriptionExpanded?: boolean;
  activeImage?: number;
  overviewCollapsed?: boolean;
}
