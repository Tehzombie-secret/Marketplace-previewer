/** volFeedbackVideoHost() */
export function getWBVideo(host: string | null | undefined): string {
  if (!host) {
    return '';
  }

  return `${getVideoBase(host)}/index.m3u8`;
}

export function getWBVideoPreview(host: string | null | undefined): string {
  if (!host) {
    return '';
  }

  return `${getVideoBase(host)}/preview.webp`;
}

function getVideoBase(host: string): string {
  // Examples:
  // https://videofeedback02.wbbasket.ru/56fb115a-8da1-4a12-b439-dd50ef25fa93/index.m3u8
  const hosts = host.split('/');
  return `https://videofeedback${`00${hosts[0]}`.slice(-2)}.wbbasket.ru/${hosts[1]}`;
}
