import { ImageSize } from '../../../server/models/image-size.enum';

const WB_SIZE_TO_PREFIX_STRATEGY: Record<ImageSize, string> = {
  [ImageSize.BIG]: 'fs',
  [ImageSize.SMALL]: 'ms',
};

export function getWBFeedbackImage(id: number | null | undefined, size: ImageSize): string {
  if (!id) {
    return '';
  }
  // Examples:
  // basket01.wb.ru/vol79/part7908/7908072/images/c246x328/1.webp
  // basket01.wb.ru/vol79/part7908/7908072/images/big/1.webp
  const sizeSegment = WB_SIZE_TO_PREFIX_STRATEGY[size ?? ImageSize.BIG];
  const volume = ~~(+(id ?? 0) / 1e5);
  const url = `https://${getFeedbackHostV2(volume)}.wb.ru/vol${volume}/part${~~(id / 1e3)}/${id}/photos/${sizeSegment}.webp`;

  return url;
}

export function getFeedbackHostV2(volume: number): string {
  if (volume >= 0 && volume <= 431) {

    return 'feedback01';
  } else if (volume >= 432 && volume <= 863) {

    return 'feedback02';
  } else if (volume >= 864 && volume <= 1199) {

    return 'feedback03';
  } else if (volume >= 1200 && volume <= 1535) {

    return 'feedback04';
  } else if (volume >= 1536 && volume <= 1919) {

    return 'feedback05';
  } else if (volume >= 1920 && volume <= 2303) {

    return 'feedback06';
  } else {

    return 'feedback07';
  }
}
