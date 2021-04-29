export declare type LookupFunction = (id: string) => number;
export declare type Formula = (s: LookupFunction, f: LookupFunction, v: LookupFunction, c: LookupFunction, t: number) => number;
export interface Stock {
    id: string;
    in: string[];
    out: string[];
    [key: string]: unknown;
}
export interface Flow {
    id: string;
    formula: Formula;
    [key: string]: unknown;
}
export interface Variable {
    id: string;
    formula: Formula;
    [key: string]: unknown;
}
export interface Parameter {
    id: string;
    value: number;
    [key: string]: unknown;
}
export interface BoxModel {
    stocks: Array<Stock>;
    flows: Array<Flow>;
    variables: Array<Variable>;
    parameters: Array<Parameter>;
    [key: string]: unknown;
}
export interface Record {
    stocks: number[];
    flows: number[];
    variables: number[];
    parameters: number[];
    t: number;
    [key: string]: unknown;
}
export declare type IVPIntegrator = (y: ReadonlyArray<number>, x: number, h: number, derivatives: (y: ReadonlyArray<number>, x: number) => number[]) => number[];
export interface BoxModelOptions {
    integrator: IVPIntegrator;
    [key: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map