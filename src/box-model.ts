import { IVPIntegrator, euler, rk4 } from './ode';

export { IVPIntegrator, euler, rk4 };

type LookupFunction = (id: string) => number;

interface LookupFunctionWithData extends LookupFunction {
  data: number[];
}

export type Formula = (
  s: LookupFunction,
  f: LookupFunction,
  v: LookupFunction,
  c: LookupFunction,
  t: number
) => number;

export interface Stock {
  readonly id: string;
  readonly in: ReadonlyArray<string>;
  readonly out: ReadonlyArray<string>;
}

export interface Flow {
  readonly id: string;
  readonly formula: Formula;
}

export interface Variable {
  readonly id: string;
  readonly formula: Formula;
}

export interface Parameter {
  readonly id: string;
  value: number;
}

export interface Record {
  stocks: number[];
  flows: number[];
  variables: number[];
  parameters: number[];
  t: number;
}

function duplicates<Type>(arr: Type[]): Type[] {
  return arr.reduce((acc, cur, curIdx, a) => {
    if (a.lastIndexOf(cur) !== curIdx) {
      a.push(cur);
    }
    return acc;
  }, [] as Type[]);
}

function sum(arr: Array<number>) {
  return arr.reduce((acc, cur) => acc + cur, 0);
}

export default class BoxModel {
  public readonly stocks: ReadonlyArray<Stock>;

  public readonly flows: ReadonlyArray<Flow>;

  public readonly variables: ReadonlyArray<Variable>;

  public readonly parameters: ReadonlyArray<Parameter>;

  public integrator: IVPIntegrator;

  protected idToIdx: { [key: string]: number };

  constructor(
    {
      stocks,
      flows,
      variables,
      parameters,
    }: {
      stocks: Stock[];
      flows: Flow[];
      variables: Variable[];
      parameters: Parameter[];
    },
    integrator: IVPIntegrator = rk4
  ) {
    this.stocks = stocks;
    this.flows = flows;
    this.variables = variables;
    this.parameters = parameters;
    this.integrator = integrator;

    this.ensureUniqueIds();

    this.idToIdx = {
      ...BoxModel.createIdToIdxMap(stocks),
      ...BoxModel.createIdToIdxMap(variables),
      ...BoxModel.createIdToIdxMap(parameters),
      ...BoxModel.createIdToIdxMap(flows),
    };
  }

  protected ensureUniqueIds(): void {
    const ids = ([] as Array<{ id: string }>)
      .concat(this.stocks, this.variables, this.parameters, this.flows)
      .map((item) => item.id);
    const duplicateIds = duplicates(ids);
    if (duplicateIds.length > 0) {
      throw new Error(`Duplicate ids found: ${JSON.stringify(duplicateIds)}`);
    }
  }

  static createIdToIdxMap(
    arr: Array<{ id: string }>
  ): { [key: string]: number } {
    return arr.reduce(
      (acc, { id }, idx) => Object.assign(acc, { [id]: idx }),
      {}
    );
  }

  public evaluateGraph(stocks: number[], t: number): Record {
    const s: LookupFunction = (id) => stocks[this.idToIdx[id]];

    const parameters = this.parameters.map(({ value }) => value);
    const p: LookupFunction = (id) => parameters[this.idToIdx[id]];

    let f: LookupFunctionWithData;
    let v: LookupFunctionWithData;

    const buildEvaluator = (
      items: ReadonlyArray<Flow> | ReadonlyArray<Variable>
    ): LookupFunctionWithData => {
      const data = new Array(items.length) as number[];
      const evaluator = (id: string) => {
        const idx = this.idToIdx[id];
        if (data[idx] === null) {
          throw new Error(`Evaluation cycle detected starting at: ${id}`);
        }

        if (typeof data[idx] === 'undefined') {
          data[idx] = null; // guard the element for cycle detection
          data[idx] = items[idx].formula(s, f, v, p, t);
        }
        return data[idx];
      };
      evaluator.data = data;
      return evaluator;
    };

    v = buildEvaluator(this.variables);
    const variables = v.data;

    f = buildEvaluator(this.flows);
    const flows = f.data;

    this.variables.forEach(({ id }) => v(id));
    this.flows.forEach(({ id }) => f(id));

    return { stocks, flows, variables, parameters, t };
  }

  public step(stocksAtT: number[], t: number, h: number): number[];
  public step(
    stocksAtT: number[],
    flowsAtT: number[],
    t: number,
    h: number
  ): number[];
  public step(
    stocksAtT: number[],
    tOrFlowsAtT: number[] | number,
    tOrH: number,
    h?: number
  ): number[] {
    return typeof tOrFlowsAtT === 'number'
      ? this.step3(stocksAtT, tOrFlowsAtT, tOrH)
      : this.step4(stocksAtT, tOrFlowsAtT, tOrH, h);
  }

  private step3(stocksAtT: number[], t: number, h: number): number[] {
    const getFlows = (y, x) => this.evaluateGraph(y, x).flows;
    return this.stepImpl(stocksAtT, getFlows, t, h);
  }

  private step4(
    stocksAtT: number[],
    flowsAtT: number[],
    t: number,
    h: number
  ): number[] {
    const getFlows = (y, x) =>
      x === t ? flowsAtT : this.evaluateGraph(y, x).flows;
    return this.stepImpl(stocksAtT, getFlows, t, h);
  }

  protected stepImpl(
    stocksAtT: number[],
    getFlows: (y: number[], x: number) => number[],
    t: number,
    h: number
  ): number[] {
    const derivatives = (y: number[], x: number): number[] => {
      const flows = getFlows(y, x);

      const f: LookupFunction = (id): number => flows[this.idToIdx[id]];
      const addFlows = (flowIds: ReadonlyArray<string>) => sum(flowIds.map(f));

      return this.stocks.map((s) => addFlows(s.in) - addFlows(s.out));
    };

    return this.integrator(stocksAtT, t, h, derivatives);
  }

  public stepExt(stocksAtT: number[], t: number, h: number): Record;
  public stepExt(
    stocksAtT: number[],
    flowsAtT: number[],
    t: number,
    h: number
  ): Record;
  public stepExt(
    stocksAtT: number[],
    tOrFlowsAtT: number[] | number,
    tOrH: number,
    h?: number
  ): Record {
    return typeof tOrFlowsAtT === 'number'
      ? this.stepExt3(stocksAtT, tOrFlowsAtT, tOrH)
      : this.stepExt4(stocksAtT, tOrFlowsAtT, tOrH, h);
  }

  private stepExt3(stocksAtT: number[], t: number, h: number): Record {
    const stocks = this.step(stocksAtT, t, h);
    return { stocks, ...this.evaluateGraph(stocks, t + h) };
  }

  private stepExt4(
    stocksAtT: number[],
    flowsAtT: number[],
    t: number,
    h: number
  ): Record {
    const stocks = this.step(stocksAtT, flowsAtT, t, h);
    return { stocks, ...this.evaluateGraph(stocks, t + h) };
  }
}

export { BoxModel };
