/** Gets current timestamp in a milliseconds, works only on Node */
export function getPreciseTime(): number {
  const hrTime = process.hrtime();
  const fractionMillis = (hrTime[0] * 1000000000 + hrTime[1]) / 1000000;
  const millis = +fractionMillis.toFixed();

  return millis;
}
