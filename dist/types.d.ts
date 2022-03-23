export declare type LookupFunction = (id: string) => number;
export declare type Formula = ({ s, f, v, p, t, }: {
    s: LookupFunction;
    f: LookupFunction;
    v: LookupFunction;
    p: LookupFunction;
    t: number;
}) => number;
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
export declare type IVPIntegrator = (y: ReadonlyArray<number>, x: number, h: number, derivatives: (y: ReadonlyArray<number>, x: number) => number[]) => number[];
export interface BoxModelOptions {
    integrator: IVPIntegrator;
}
//# sourceMappingURL=types.d.ts.map