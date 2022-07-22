import { PersonReference } from '../person/person-reference.interface';
import { ProductReference } from '../product/product-reference.interface';
import { ReferenceType } from './reference-type.enum';

export type PhotoEntityReference<T extends ReferenceType> = {
  type: T;
  item: Partial<ReferenceTypeToEntityMapper[T]> | null;
}

export class ReferenceTypeToEntityMapper implements Record<ReferenceType, any> {
  [ReferenceType.PERSON]!: PersonReference;
  [ReferenceType.PRODUCT]!: ProductReference;
}
