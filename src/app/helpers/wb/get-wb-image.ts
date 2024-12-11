import { ImageSize } from '../../../server/models/image-size.enum';

const WB_SIZE_TO_PREFIX_STRATEGY: Record<ImageSize, string> = {
  [ImageSize.BIG]: 'big',
  [ImageSize.SMALL]: 'tm',
};

export function getWBImage(id: string | number | null | undefined, name: string | number, size: ImageSize): string {
  if (!id) {
    return '';
  }
  // Examples:
  // basket01.wb.ru/vol79/part7908/7908072/images/c246x328/1.jpg
  // basket01.wb.ru/vol79/part7908/7908072/images/big/1.jpg
  const sizeSegment = WB_SIZE_TO_PREFIX_STRATEGY[size ?? ImageSize.BIG];
  const volume = ~~(+(id ?? 0) / 1e5);
  const url = `https://${getHostV2(volume)}.wbbasket.ru/vol${volume}/part${~~(+id / 1e3)}/${id}/images/${sizeSegment}/${name}.webp`;

  return url;
}

// index.js, volHostV2, search "~~"
export function getHostV2(volume: number): string {
  if (volume >= 0 && volume <= 143) {

    return 'basket-01';
  } else if (volume <= 287) {

    return 'basket-02';
  } else if (volume <= 431) {

    return 'basket-03';
  } else if (volume <= 719) {

    return 'basket-04';
  } else if (volume <= 1007) {

    return 'basket-05';
  } else if (volume <= 1061) {

    return 'basket-06';
  } else if (volume <= 1115) {

    return 'basket-07';
  } else if (volume <= 1169) {

    return 'basket-08';
  } else if (volume <= 1313) {

    return 'basket-09';
  } else if (volume <= 1601) {

    return 'basket-10';
  } else if (volume <= 1655) {

    return 'basket-11';
  } else if (volume <= 1919) {

    return 'basket-12';
  } else if (volume <= 2045) {

    return 'basket-13';
  } else if (volume <= 2189) {

    return 'basket-14';
  } else if (volume <= 2405) {

    return 'basket-15';
  } else if (volume <= 2621) {

    return 'basket-16';
  } else if (volume <= 2837) {

    return 'basket-17';
  } else if (volume <= 3053) {

    return 'basket-18';
  } else if (volume <= 3269) {

    return 'basket-19';
  } else if (volume <= 3485) {

    return 'basket-20';
  } else {

    return 'basket-21';
  }
}
