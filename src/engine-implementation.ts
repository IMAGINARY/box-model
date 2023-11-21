import { IVPIntegrator } from './types';
import { rk4 } from './ode';

// TODO: Move types to types.ts
type Flow = { value: number; from: number; to: number };

type FlowGetter = (stocks: ReadonlyArray<number>, t: number) => Flow[];
type ReadonlyFlowGetter = (
  stocks: ReadonlyArray<number>,
  t: number
) => ReadonlyArray<Readonly<Flow>>;

type ConvergenceCriterionResult<T> = { userdata: T; done: boolean };
type ConvergenceCriterion<T> = (
  stocksAtT: ReadonlyArray<number>,
  t: number,
  previousResult: T | undefined,
  i: number
) => ConvergenceCriterionResult<T>;

function derivatives(getFlows: ReadonlyFlowGetter) {
  return (y: ReadonlyArray<number>, x: number): number[] => {
    const dydx = new Array<number>(y.length).fill(0.0);
    const flows = getFlows(y, x);
    flows.forEach(({ value, from, to }) => {
      if (from >= 0 && from < dydx.length) dydx[from] -= value;
      if (to >= 0 && to < dydx.length) dydx[to] += value;
    });
    return dydx;
  };
}

function stepImpl(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  getFlows: ReadonlyFlowGetter,
  integrator: IVPIntegrator = rk4
): number[] {
  return integrator(stocksAtT, t, h, derivatives(getFlows));
}

function convergeImpl<T>(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  getFlows: ReadonlyFlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator: IVPIntegrator = rk4
): T {
  let iterations = 0;
  let { userdata, done } = criterion(stocksAtT, t, undefined, iterations);

  if (!done) {
    const myDerivatives = derivatives(getFlows);
    while (!done) {
      /* eslint-disable no-param-reassign */
      stocksAtT = integrator(stocksAtT, t, h, myDerivatives);
      t += h;
      iterations += 1;
      ({ userdata, done } = criterion(stocksAtT, t, userdata, iterations));
    }
  }

  return userdata;
}

export type { Flow, FlowGetter, ReadonlyFlowGetter, ConvergenceCriterion };
export { stepImpl, convergeImpl };
