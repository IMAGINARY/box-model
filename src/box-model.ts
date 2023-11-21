import {
  BoxModel,
  BoxModelOptions,
  LookupFunction,
  Record,
  IVPIntegrator,
} from './types';

import { rk4 } from './ode';

import { sum, hasOwnProperty, throwLookupError } from './util';

type FlowGetter = (
  y: ReadonlyArray<number>,
  x: number
) => ReadonlyArray<number>;

type ConvergenceCriterion = (
  r: Record,
  rPrevious: Record,
  i: number,
  bme: BoxModelEngine
) => boolean;

export default class BoxModelEngine {
  public model: BoxModel;

  public integrator: IVPIntegrator;

  constructor(model: BoxModel, options: BoxModelOptions = { integrator: rk4 }) {
    this.model = model;
    this.integrator = options.integrator;
  }

  public static createIdToIdxMap(arr: ReadonlyArray<{ readonly id: string }>): {
    [key: string]: number;
  } {
    return arr.reduce((acc: { [key: string]: number }, { id }, idx) => {
      acc[id] = idx;
      return acc;
    }, {});
  }

  public createGraphEvaluator(): (
    stocks: ReadonlyArray<number>,
    t: number
  ) => Record {
    const { stocks: ms, flows: mf, variables: mv, parameters: mp } = this.model;

    const stockIdToIdx = BoxModelEngine.createIdToIdxMap(ms);
    const flowIdToIdx = BoxModelEngine.createIdToIdxMap(mf);
    const variableIdToIdx = BoxModelEngine.createIdToIdxMap(mv);
    const parameterIdToIdx = BoxModelEngine.createIdToIdxMap(mp);

    let r: Record = {
      t: 0,
      stocks: new Array(ms.length) as number[],
      flows: new Array(mf.length) as number[],
      variables: new Array(mv.length) as number[],
      parameters: new Array(mp.length) as number[],
    };

    const flowInitializing = new Array(mf.length) as boolean[];
    const variableInitializing = new Array(mv.length) as boolean[];

    const s: LookupFunction = (id) => {
      if (!hasOwnProperty(stockIdToIdx, id)) throwLookupError('stock', id);
      return r.stocks[stockIdToIdx[id]];
    };

    const p: LookupFunction = (id) => {
      if (!hasOwnProperty(parameterIdToIdx, id))
        throwLookupError('parameter', id);
      return r.parameters[parameterIdToIdx[id]];
    };

    let v: LookupFunction;

    const f: LookupFunction = (id) => {
      if (!hasOwnProperty(flowIdToIdx, id)) throwLookupError('variable', id);
      const idx = flowIdToIdx[id];
      if (r.flows[idx] === undefined) {
        // not initialized yet
        if (flowInitializing[idx]) {
          throw new Error(`Evaluation cycle detected starting at: flow ${id}`);
        } else {
          flowInitializing[idx] = true; // guard the element for cycle detection
          r.flows[idx] = mf[idx].formula({ s, f, v, p, t: r.t });
        }
      }
      return r.flows[idx];
    };

    v = (id) => {
      if (!hasOwnProperty(variableIdToIdx, id))
        throwLookupError('variable', id);
      const idx = variableIdToIdx[id];
      if (r.variables[idx] === undefined) {
        // not initialized yet
        if (variableInitializing[idx]) {
          throw new Error(
            `Evaluation cycle detected starting at: variable ${id}`
          );
        } else {
          variableInitializing[idx] = true; // guard the element for cycle detection
          r.variables[idx] = mv[idx].formula({ s, f, v, p, t: r.t });
        }
      }
      return r.variables[idx];
    };

    const evaluator = (stocks: ReadonlyArray<number>, t: number): Record => {
      r = {
        t,
        stocks: stocks as number[],
        flows: new Array(mf.length) as number[],
        variables: new Array(mv.length) as number[],
        parameters: mp.map(({ value }) => value),
      };

      flowInitializing.fill(false);
      variableInitializing.fill(false);

      this.model.variables.forEach(({ id }) => v(id));
      this.model.flows.forEach(({ id }) => f(id));

      return r;
    };

    return evaluator;
  }

  public evaluateGraph(stocks: ReadonlyArray<number>, t: number): Record {
    return this.createGraphEvaluator()(stocks, t);
  }

  public step(stocksAtT: ReadonlyArray<number>, t: number, h: number): number[];
  public step(
    stocksAtT: ReadonlyArray<number>,
    flowsAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): number[];
  public step(
    stocksAtT: ReadonlyArray<number>,
    tOrFlowsAtT: ReadonlyArray<number> | number,
    tOrH: number,
    h?: number
  ): number[] {
    if (typeof tOrFlowsAtT === 'number')
      return this.step3(stocksAtT, tOrFlowsAtT, tOrH);
    if (typeof h !== 'undefined')
      return this.step4(stocksAtT, tOrFlowsAtT, tOrH, h);
    throw new TypeError();
  }

  private step3(
    stocksAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): number[] {
    const evaluateGraph = this.createGraphEvaluator();
    const getFlows: FlowGetter = (y, x) => evaluateGraph(y, x).flows;
    return this.stepImpl(stocksAtT, getFlows, t, h);
  }

  private step4(
    stocksAtT: ReadonlyArray<number>,
    flowsAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): number[] {
    const evaluateGraph = this.createGraphEvaluator();
    const getFlows: FlowGetter = (y, x) =>
      x === t ? flowsAtT : evaluateGraph(y, x).flows;
    return this.stepImpl(stocksAtT, getFlows, t, h);
  }

  protected stepImpl(
    stocksAtT: ReadonlyArray<number>,
    getFlows: FlowGetter,
    t: number,
    h: number
  ): number[] {
    const flowIdToIdx = BoxModelEngine.createIdToIdxMap(this.model.flows);

    const derivatives = (y: ReadonlyArray<number>, x: number): number[] => {
      const flows = getFlows(y, x);

      const f: LookupFunction = (id): number => flows[flowIdToIdx[id]];
      const addFlows = (flowIds: ReadonlyArray<string>) => sum(flowIds.map(f));

      return this.model.stocks.map((s) => addFlows(s.in) - addFlows(s.out));
    };

    return this.integrator(stocksAtT, t, h, derivatives);
  }

  public stepExt(
    stocksAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): Record;
  public stepExt(
    stocksAtT: ReadonlyArray<number>,
    flowsAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): Record;
  public stepExt(
    stocksAtT: ReadonlyArray<number>,
    tOrFlowsAtT: ReadonlyArray<number> | number,
    tOrH: number,
    h?: number
  ): Record {
    if (typeof tOrFlowsAtT === 'number')
      return this.stepExt3(stocksAtT, tOrFlowsAtT, tOrH);
    if (typeof h !== 'undefined')
      return this.stepExt4(stocksAtT, tOrFlowsAtT, tOrH, h);
    throw new TypeError();
  }

  private stepExt3(
    stocksAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): Record {
    const stocks = this.step(stocksAtT, t, h);
    return this.evaluateGraph(stocks, t + h);
  }

  private stepExt4(
    stocksAtT: ReadonlyArray<number>,
    flowsAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): Record {
    const stocks = this.step(stocksAtT, flowsAtT, t, h);
    return this.evaluateGraph(stocks, t + h);
  }

  public converge(
    stocksAtT: ReadonlyArray<number>,
    t: number,
    h: number,
    criteria: ConvergenceCriterion
  ): number[] {
    return this.convergeExt(stocksAtT, t, h, criteria).stocks;
  }

  public convergeExt(
    stocksAtT: ReadonlyArray<number>,
    t: number,
    h: number,
    criterion: ConvergenceCriterion
  ): Record {
    const evaluateGraph = this.createGraphEvaluator();
    let lastRecord = evaluateGraph(stocksAtT, t);
    const getFlows: FlowGetter = (y, x) =>
      x === lastRecord.t ? lastRecord.flows : evaluateGraph(y, x).flows;
    for (let i = 0, stop = false; !stop; i += 1) {
      const stocks = this.stepImpl(
        lastRecord.stocks,
        getFlows,
        lastRecord.t,
        h
      );
      const record = evaluateGraph(stocks, t + i * h);
      stop = criterion(record, lastRecord, i, this);
      lastRecord = record;
    }
    return lastRecord;
  }
}

export { BoxModelEngine, ConvergenceCriterion };
