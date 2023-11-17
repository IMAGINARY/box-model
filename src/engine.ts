import type {
  Flow,
  FlowGetter,
  ReadonlyFlowGetter,
  ConvergenceCriterion,
} from './engine-implementation';
import { stepImpl, convergeImpl } from './engine-implementation';
import { IVPIntegrator } from './types';

function step5(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  integrator?: IVPIntegrator
): number[] {
  return stepImpl(stocksAtT, t, h, computeFlows, integrator);
}

function step6(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<Readonly<Flow>>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  integrator?: IVPIntegrator
): number[] {
  const getFlows: ReadonlyFlowGetter = (y, x) =>
    x === t ? flowsAtT : computeFlows(y, x);
  return stepImpl(stocksAtT, t, h, getFlows, integrator);
}

function step(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  integrator?: IVPIntegrator
): number[];
function step(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<Readonly<Flow>>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  integrator?: IVPIntegrator
): number[];
function step(
  stocksAtT: ReadonlyArray<number>,
  tOrFlowsAtT: number | ReadonlyArray<Readonly<Flow>>,
  tOrH: number,
  hOrComputeFlows: number | ReadonlyFlowGetter,
  computeFlowsOrIntegrator?: ReadonlyFlowGetter | IVPIntegrator,
  integrator?: IVPIntegrator
): number[] {
  if (typeof tOrFlowsAtT === 'number')
    return step5(
      stocksAtT,
      tOrFlowsAtT,
      tOrH,
      hOrComputeFlows as ReadonlyFlowGetter,
      computeFlowsOrIntegrator as IVPIntegrator
    );

  return step6(
    stocksAtT,
    tOrFlowsAtT,
    tOrH,
    hOrComputeFlows as number,
    computeFlowsOrIntegrator as ReadonlyFlowGetter,
    integrator as IVPIntegrator
  );
}

function converge6<T>(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T {
  return convergeImpl(stocksAtT, t, h, computeFlows, criterion, integrator);
}

function converge7<T>(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<Readonly<Flow>>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T {
  const getFlows: ReadonlyFlowGetter = (y, x) =>
    x === t ? flowsAtT : computeFlows(y, x);
  return convergeImpl(stocksAtT, t, h, getFlows, criterion, integrator);
}

function converge<T>(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T;
function converge<T>(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<Readonly<Flow>>,
  t: number,
  h: number,
  computeFlows: ReadonlyFlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T;
function converge<T>(
  stocksAtT: ReadonlyArray<number>,
  tOrFlowsAtT: number | ReadonlyArray<Readonly<Flow>>,
  tOrH: number,
  hOrComputeFlows: number | ReadonlyFlowGetter,
  computeFlowsOrCriterion: ReadonlyFlowGetter | ConvergenceCriterion<T>,
  criterionOrIntegrator?: ConvergenceCriterion<T> | IVPIntegrator,
  integrator?: IVPIntegrator
): T {
  if (typeof tOrFlowsAtT === 'number')
    return converge6<T>(
      stocksAtT,
      tOrFlowsAtT,
      tOrH,
      hOrComputeFlows as ReadonlyFlowGetter,
      computeFlowsOrCriterion as ConvergenceCriterion<T>,
      criterionOrIntegrator as IVPIntegrator
    );

  return converge7<T>(
    stocksAtT,
    tOrFlowsAtT,
    tOrH,
    hOrComputeFlows as number,
    computeFlowsOrCriterion as ReadonlyFlowGetter,
    criterionOrIntegrator as ConvergenceCriterion<T>,
    integrator as IVPIntegrator
  );
}

export type { Flow, FlowGetter, ReadonlyFlowGetter, ConvergenceCriterion };
export { step, converge };
