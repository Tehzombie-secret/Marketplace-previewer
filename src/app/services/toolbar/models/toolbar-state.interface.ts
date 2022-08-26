import { APIPlatform } from '../../api/models/api-platform.enum';

export interface ToolbarState {
  platform: APIPlatform | null;
  platformColor: string | null;
  title: string;
}
