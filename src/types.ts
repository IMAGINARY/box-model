export type LookupFunction = (id: string) => number;

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

export type IVPIntegrator = (
  y: number[],
  x: number,
  h: number,
  derivatives: (y: number[], x: number) => number[]
) => number[];
