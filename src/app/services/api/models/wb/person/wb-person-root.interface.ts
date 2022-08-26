import { WBProfileWrapper } from './wb-profile-wrapper.interface';

export interface WBPersonRoot {
  ResultState: number;
  Value?: { data: WBProfileWrapper };
  value?: { data: WBProfileWrapper };

  /** Custom field, not part of original response */
  path: string;
}
