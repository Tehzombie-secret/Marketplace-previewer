import { WBCharacteristics } from './wb-characteristics.interface';

export interface WBGroupedOption {
  group_name: string;
  group_id: number;
  options: WBCharacteristics[];
}
