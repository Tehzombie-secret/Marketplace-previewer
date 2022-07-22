import { SettingsKey } from '../models/settings-key.enum';

export class SettingsKeyToTypeMapper implements Record<SettingsKey, any> {
  [SettingsKey.GALLERY_MODE]!: boolean;
}
