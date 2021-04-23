export type LookupFunction = (id: string) => number;

export type Formula = (
  s: LookupFunction,
  f: LookupFunction,
  v: LookupFunction,
  c: LookupFunction,
  t: number
) => number;

export interface Stock {
  id: string;
  in: string[];
  out: string[];
}

export interface Flow {
  id: string;
  formula: Formula;
}

export interface Variable {
  id: string;
  formula: Formula;
}

export interface Parameter {
  id: string;
  value: number;
}

export interface BoxModel {
  stocks: Array<Stock>;
  flows: Array<Flow>;
  variables: Array<Variable>;
  parameters: Array<Parameter>;
}

export interface Record {
  stocks: number[];
  flows: number[];
  variables: number[];
  parameters: number[];
  t: number;
}

export type IVPIntegrator = (
  y: ReadonlyArray<number>,
  x: number,
  h: number,
  derivatives: (y: ReadonlyArray<number>, x: number) => number[]
) => number[];

export interface BoxModelOptions {
  integrator: IVPIntegrator;
}