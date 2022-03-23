import {
  BoxModel,
  BoxModelOptions,
  LookupFunction,
  Record,
  IVPIntegrator,
} from './types';

import { rk4 } from './ode';

import { sum, hasOwnProperty } from './util';

interface LookupFunctionWithData extends LookupFunction {
  data: (number | boolean)[];
}

type FlowGetter = (
  y: ReadonlyArray<number>,
  x: number
) => ReadonlyArray<number>;

function throwLookupError(tableName: string, id: string) {
  throw new Error(
    `Value of unknown ${tableName} requested: ${id}. Check your box model definition.`
  );
}

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

  public evaluateGraph(stocks: ReadonlyArray<number>, t: number): Record {
    const stockIdToIdx = BoxModelEngine.createIdToIdxMap(this.model.stocks);
    const s: LookupFunction = (id) => {
      if (!hasOwnProperty(stockIdToIdx, id)) throwLookupError('stock', id);
      return stocks[stockIdToIdx[id]];
    };

    const parameterIdToIdx = BoxModelEngine.createIdToIdxMap(
      this.model.parameters
    );
    const parameters = this.model.parameters.map(({ value }) => value);
    const p: LookupFunction = (id) => {
      if (!hasOwnProperty(parameterIdToIdx, id))
        throwLookupError('parameter', id);
      return parameters[parameterIdToIdx[id]];
    };

    const [f, v] = [
      { items: this.model.flows, name: 'flow' },
      { items: this.model.variables, name: 'variable' },
    ].map(({ items, name }): LookupFunctionWithData => {
      // build graph evaluator functions
      const idToIdx = BoxModelEngine.createIdToIdxMap(items);
      const data: (number | boolean)[] = items.map(() => false);
      const evaluator = (id: string) => {
        if (!hasOwnProperty(idToIdx, id)) throwLookupError(name, id);
        const idx = idToIdx[id];
        if (typeof data[idx] === 'boolean') {
          // not initialized yet
          if (data[idx]) {
            throw new Error(`Evaluation cycle detected starting at: ${id}`);
          } else {
            data[idx] = true; // guard the element for cycle detection
            data[idx] = items[idx].formula({ s, f, v, p, t });
            return data[idx] as number;
          }
        } else {
          return data[idx] as number;
        }
      };
      evaluator.data = data;
      return evaluator;
    });

    this.model.variables.forEach(({ id }) => v(id));
    this.model.flows.forEach(({ id }) => f(id));

    return {
      stocks: stocks as number[],
      flows: f.data as number[],
      variables: v.data as number[],
      parameters,
      t,
    };
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
    const getFlows: FlowGetter = (y, x) => this.evaluateGraph(y, x).flows;
    return this.stepImpl(stocksAtT, getFlows, t, h);
  }

  private step4(
    stocksAtT: ReadonlyArray<number>,
    flowsAtT: ReadonlyArray<number>,
    t: number,
    h: number
  ): number[] {
    const getFlows: FlowGetter = (y, x) =>
      x === t ? flowsAtT : this.evaluateGraph(y, x).flows;
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
    let lastRecord = this.evaluateGraph(stocksAtT, t);
    const getFlows: FlowGetter = (y, x) =>
      x === lastRecord.t ? lastRecord.flows : this.evaluateGraph(y, x).flows;
    for (let i = 0, stop = false; !stop; i += 1) {
      const stocks = this.stepImpl(
        lastRecord.stocks,
        getFlows,
        lastRecord.t,
        h
      );
      const record = this.evaluateGraph(stocks, t + i * h);
      stop = criterion(record, lastRecord, i, this);
      lastRecord = record;
    }
    return lastRecord;
  }
}

export { BoxModelEngine, ConvergenceCriterion };
