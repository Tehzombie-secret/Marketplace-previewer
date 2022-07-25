import { WBCharacteristics } from './wb-characteristics.interface';
import { WBGroupedOption } from './wb-grouped-option.interface';
import { WBMedia } from './wb-media.interface';
import { WBProductData } from './wb-product-data.interface';
import { WBSeller } from './wb-seller.interface';
import { WBSizeTable } from './wb-size-table.interface';

export interface WBProduct {
  imt_id: number;
  nm_id: number;
  imt_name: string;
  description: string;
  /** Subcategory */
  subj_name: string;
  /** Category */
  subj_root_name: string;
  /** Tags */
  kinds: string;
  grouped_options: WBGroupedOption[];
  options: WBCharacteristics[];
  compositions: WBCharacteristics[];
  sizes_table: WBSizeTable;
  nm_colors_names: string;
  colors: number;
  /** What's inside product */
  contents: string;
  full_colors: { nm_id: number }[];
  selling: WBSeller;
  media: WBMedia;
  data: WBProductData;
}
