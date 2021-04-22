export function euler(
  y: number[],
  x: number,
  h: number,
  derivatives: (y: number[], x: number) => number[]
): number[] {
  const dydx = derivatives(y, x);
  return y.map((yi, i) => yi + h * dydx[i]);
}

export function rk4(
  y: number[],
  x: number,
  h: number,
  derivatives: (y: number[], x: number) => number[]
): number[] {
  const n: number = y.length;

  const dydx = derivatives(y, x);
  const yTemp: number[] = new Array(n) as number[];

  const h2 = h / 2.0;
  const h6 = h / 6.0;
  const xhh = x + h2;

  for (let i = 0; i < n; i += 1) yTemp[i] = y[i] + h2 * dydx[i];
  let dydxTemp = derivatives(yTemp, xhh);

  for (let i = 0; i < n; i += 1) yTemp[i] = y[i] + h2 * dydxTemp[i];
  const dydxM = derivatives(yTemp, xhh);

  for (let i = 0; i < n; i += 1) {
    yTemp[i] = y[i] + h * dydxM[i];
    dydxM[i] += dydxTemp[i];
  }
  dydxTemp = derivatives(yTemp, x + h);

  return y.map((_, i) => y[i] + h6 * (dydx[i] + dydxTemp[i] + 2.0 * dydxM[i]));
}
