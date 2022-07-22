import * as zlib from 'zlib';

export function getBrotliContent(content: Buffer, quality = zlib.constants.BROTLI_MAX_QUALITY): Promise<Buffer> {
  return new Promise<Buffer>((resolve: (item: Buffer) => void, reject: (error: Error) => void) => {
    const brotliParams: zlib.BrotliOptions = {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: quality,
      },
    };

    zlib.brotliCompress(content, brotliParams, (error: Error | null, result: Buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
