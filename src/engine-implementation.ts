import { IVPIntegrator } from './types';
import { rk4 } from './ode';

// TODO: Move types to types.ts
// Returns the sum of all flows into and out of a stock at time t
type FlowGetter = (stocks: ReadonlyArray<number>, t: number) => Array<number>;

type ConvergenceCriterionResult<T> = { userdata: T; done: boolean };
type ConvergenceCriterion<T> = (
  stocksAtT: ReadonlyArray<number>,
  t: number,
  previousResult: T | undefined,
  i: number
) => ConvergenceCriterionResult<T>;

function stepImpl(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  getFlows: FlowGetter,
  integrator: IVPIntegrator = rk4
): number[] {
  return integrator(stocksAtT, t, h, getFlows);
}

function convergeImpl<T>(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  getFlows: FlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator: IVPIntegrator = rk4
): T {
  let iterations = 0;
  let { userdata, done } = criterion(stocksAtT, t, undefined, iterations);

  if (!done) {
    while (!done) {
      /* eslint-disable no-param-reassign */
      stocksAtT = integrator(stocksAtT, t, h, getFlows);
      t += h;
      iterations += 1;
      ({ userdata, done } = criterion(stocksAtT, t, userdata, iterations));
    }
  }

  return userdata;
}

export type { FlowGetter, ConvergenceCriterion };
export { stepImpl, convergeImpl };
