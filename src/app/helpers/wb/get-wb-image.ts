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
  const url = `https://${getHostV2(volume)}.wb.ru/vol${volume}/part${~~(+id / 1e3)}/${id}/images/${sizeSegment}/${name}.jpg`;

  return url;
}

export function getHostV2(volume: number): string {
  if (volume >= 0 && volume <= 143) {

    return 'basket-01';
  } else if (volume >= 144 && volume <= 287) {

    return 'basket-02';
  } else if (volume >= 288 && volume <= 431) {

    return 'basket-03';
  } else if (volume >= 432 && volume <= 719) {

    return 'basket-04';
  } else if (volume >= 720 && volume <= 1007) {

    return 'basket-05';
  } else if (volume >= 1008 && volume <= 1061) {

    return 'basket-06';
  } else if (volume >= 1062 && volume <= 1115) {

    return 'basket-07';
  } else if (volume >= 1116 && volume <= 1169) {

    return 'basket-08';
  } else if (volume >= 1170 && volume <= 1313) {

    return 'basket-09';
  } else if (volume >= 1314 && volume <= 1601) {

    return 'basket-10';
  } else if (volume >= 1602 && volume <= 1655) {

    return 'basket-11';
  } else if (volume >= 1656 && volume <= 1919) {

    return 'basket-12';
  } else if (volume >= 1920 && volume <= 2045) {

    return 'basket-13';
  } else if (volume >= 2046 && volume <= 2189) {

    return 'basket-14';
  } else {

    return 'basket-15';
  }
}
