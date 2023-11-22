import type { FlowGetter, ConvergenceCriterion } from './engine-implementation';
import { stepImpl, convergeImpl } from './engine-implementation';
import { IVPIntegrator } from './types';

function step5(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  integrator?: IVPIntegrator
): number[] {
  return stepImpl(stocksAtT, t, h, computeFlows, integrator);
}

function step6(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  integrator?: IVPIntegrator
): number[] {
  const mutableFlowsAtT = [...flowsAtT];
  const getFlows: FlowGetter = (y, x) =>
    x === t ? mutableFlowsAtT : computeFlows(y, x);
  return stepImpl(stocksAtT, t, h, getFlows, integrator);
}

function step(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  integrator?: IVPIntegrator
): number[];
function step(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  integrator?: IVPIntegrator
): number[];
function step(
  stocksAtT: ReadonlyArray<number>,
  tOrFlowsAtT: number | ReadonlyArray<number>,
  tOrH: number,
  hOrComputeFlows: number | FlowGetter,
  computeFlowsOrIntegrator?: FlowGetter | IVPIntegrator,
  integrator?: IVPIntegrator
): number[] {
  if (typeof tOrFlowsAtT === 'number')
    return step5(
      stocksAtT,
      tOrFlowsAtT,
      tOrH,
      hOrComputeFlows as FlowGetter,
      computeFlowsOrIntegrator as IVPIntegrator
    );

  return step6(
    stocksAtT,
    tOrFlowsAtT,
    tOrH,
    hOrComputeFlows as number,
    computeFlowsOrIntegrator as FlowGetter,
    integrator as IVPIntegrator
  );
}

function converge6<T>(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T {
  return convergeImpl(stocksAtT, t, h, computeFlows, criterion, integrator);
}

function converge7<T>(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T {
  const mutableFlowsAtT = [...flowsAtT];
  const getFlows: FlowGetter = (y, x) =>
    x === t ? mutableFlowsAtT : computeFlows(y, x);
  return convergeImpl(stocksAtT, t, h, getFlows, criterion, integrator);
}

function converge<T>(
  stocksAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T;
function converge<T>(
  stocksAtT: ReadonlyArray<number>,
  flowsAtT: ReadonlyArray<number>,
  t: number,
  h: number,
  computeFlows: FlowGetter,
  criterion: ConvergenceCriterion<T>,
  integrator?: IVPIntegrator
): T;
function converge<T>(
  stocksAtT: ReadonlyArray<number>,
  tOrFlowsAtT: number | ReadonlyArray<number>,
  tOrH: number,
  hOrComputeFlows: number | FlowGetter,
  computeFlowsOrCriterion: FlowGetter | ConvergenceCriterion<T>,
  criterionOrIntegrator?: ConvergenceCriterion<T> | IVPIntegrator,
  integrator?: IVPIntegrator
): T {
  if (typeof tOrFlowsAtT === 'number')
    return converge6<T>(
      stocksAtT,
      tOrFlowsAtT,
      tOrH,
      hOrComputeFlows as FlowGetter,
      computeFlowsOrCriterion as ConvergenceCriterion<T>,
      criterionOrIntegrator as IVPIntegrator
    );

  return converge7<T>(
    stocksAtT,
    tOrFlowsAtT,
    tOrH,
    hOrComputeFlows as number,
    computeFlowsOrCriterion as FlowGetter,
    criterionOrIntegrator as ConvergenceCriterion<T>,
    integrator as IVPIntegrator
  );
}

export type { FlowGetter, ConvergenceCriterion };
export { step, converge };
