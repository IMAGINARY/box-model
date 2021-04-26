import { NumericArray } from './types';

export function euler<T extends NumericArray>(
  y: T,
  x: number,
  h: number,
  derivatives: (y: T, x: number) => T
): T {
  const dydx = derivatives(y, x);
  return y.map((yi, i) => yi + h * dydx[i]);
}

export function rk4<T extends NumericArray>(
  y: T,
  x: number,
  h: number,
  derivatives: (y: T, x: number) => T
): T {
  const n: number = y.length;

  const dydx = derivatives(y, x);
  const yTemp = y.map(() => 0);

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
