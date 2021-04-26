import {
  Flow,
  Variable,
  BoxModel,
  BoxModelOptions,
  LookupFunction,
  Record,
  NumericArray,
  IVPIntegrator,
} from './types';

import { rk4 } from './ode';

interface LookupFunctionWithData extends LookupFunction {
  data: (number | boolean)[];
}

type FlowGetter<T extends NumericArray> = (y: T, x: number) => T;

function sum<T extends NumericArray>(arr: T): number {
  return arr.reduce((acc, cur) => acc + cur, 0);
}

export default class BoxModelEngine<T extends NumericArray> {
  public model: BoxModel;

  public integrator: IVPIntegrator<T>;

  constructor(
    model: BoxModel,
    options: BoxModelOptions<T> = { integrator: rk4 }
  ) {
    this.model = model;
    this.integrator = options.integrator;
  }

  public static createIdToIdxMap(
    arr: ReadonlyArray<{ readonly id: string }>
  ): { [key: string]: number } {
    return arr.reduce((acc: { [key: string]: number }, { id }, idx) => {
      acc[id] = idx;
      return acc;
    }, {});
  }

  public evaluateGraph(stocks: T, t: number): Record<T> {
    const stockIdToIdx = BoxModelEngine.createIdToIdxMap(this.model.stocks);
    const s: LookupFunction = (id) => stocks[stockIdToIdx[id]];

    const parameterIdToIdx = BoxModelEngine.createIdToIdxMap(
      this.model.parameters
    );

    const parameters = this.model.parameters.map(({ value }) => value);
    const p: LookupFunction = (id) => parameters[parameterIdToIdx[id]];

    let f: LookupFunctionWithData;
    let v: LookupFunctionWithData;

    const buildEvaluator = (
      items: ReadonlyArray<Flow> | ReadonlyArray<Variable>
    ): LookupFunctionWithData => {
      const idToIdx = BoxModelEngine.createIdToIdxMap(items);
      const data: (number | boolean)[] = items.map(() => false);
      const evaluator = (id: string) => {
        const idx = idToIdx[id];
        if (typeof data[idx] === 'boolean') {
          // not initialized yet
          if (data[idx]) {
            throw new Error(`Evaluation cycle detected starting at: ${id}`);
          } else {
            data[idx] = true; // guard the element for cycle detection
            data[idx] = items[idx].formula(s, f, v, p, t);
            return data[idx] as number;
          }
        } else {
          return data[idx] as number;
        }
      };
      evaluator.data = data;
      return evaluator;
    };

    v = buildEvaluator(this.model.variables);

    f = buildEvaluator(this.model.flows);

    this.model.variables.forEach(({ id }) => v(id));
    this.model.flows.forEach(({ id }) => f(id));

    return {
      stocks,
      flows: f.data,
      variables: v.data,
      parameters,
      t,
    };
  }

  public step(stocksAtT: T, t: number, h: number): T;
  public step(stocksAtT: T, flowsAtT: T, t: number, h: number): T;
  public step(
    stocksAtT: T,
    tOrFlowsAtT: T | number,
    tOrH: number,
    h?: number
  ): T {
    if (typeof tOrFlowsAtT === 'number')
      return this.step3(stocksAtT, tOrFlowsAtT, tOrH);
    if (typeof h !== 'undefined')
      return this.step4(stocksAtT, tOrFlowsAtT, tOrH, h);
    throw new TypeError();
  }

  private step3(stocksAtT: T, t: number, h: number): T {
    const getFlows: FlowGetter<T> = (y, x) => this.evaluateGraph(y, x).flows;
    return this.stepImpl(stocksAtT, getFlows, t, h);
  }

  private step4(stocksAtT: T, flowsAtT: T, t: number, h: number): T {
    const getFlows: FlowGetter<T> = (y, x) =>
      x === t ? flowsAtT : this.evaluateGraph(y, x).flows;
    return this.stepImpl(stocksAtT, getFlows, t, h);
  }

  protected stepImpl(
    stocksAtT: T,
    getFlows: FlowGetter<T>,
    t: number,
    h: number
  ): T {
    const flowIdToIdx = BoxModelEngine.createIdToIdxMap(this.model.flows);

    const derivatives = (y: T, x: number): T => {
      const flows = getFlows(y, x);

      const f: LookupFunction = (id): number => flows[flowIdToIdx[id]];
      const addFlows = (flowIds: ReadonlyArray<string>) => sum(flowIds.map(f));

      const s = this.model.stocks;
      return stocksAtT.map((_, i) => addFlows(s[i].in) - addFlows(s[i].out));
    };

    return this.integrator(stocksAtT, t, h, derivatives);
  }

  public stepExt(stocksAtT: T, t: number, h: number): Record<T>;
  public stepExt(stocksAtT: T, flowsAtT: T, t: number, h: number): Record<T>;
  public stepExt(
    stocksAtT: T,
    tOrFlowsAtT: T | number,
    tOrH: number,
    h?: number
  ): Record<T> {
    if (typeof tOrFlowsAtT === 'number')
      return this.stepExt3(stocksAtT, tOrFlowsAtT, tOrH);
    if (typeof h !== 'undefined')
      return this.stepExt4(stocksAtT, tOrFlowsAtT, tOrH, h);
    throw new TypeError();
  }

  private stepExt3(stocksAtT: T, t: number, h: number): Record<T> {
    const stocks = this.step(stocksAtT, t, h);
    return this.evaluateGraph(stocks, t + h);
  }

  private stepExt4(stocksAtT: T, flowsAtT: T, t: number, h: number): Record<T> {
    const stocks = this.step(stocksAtT, flowsAtT, t, h);
    return this.evaluateGraph(stocks, t + h);
  }
}

export { BoxModelEngine };
