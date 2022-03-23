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
export interface BoxModelElements<TStock, TFlow, TVariable, TParameter> {
    stocks: TStock[];
    flows: TFlow[];
    variables: TVariable[];
    parameters: TParameter[];
}
export declare type BoxModelElementKey = 'stocks' | 'flows' | 'variables' | 'parameters';
export declare type BoxModel = BoxModelElements<Stock, Flow, Variable, Parameter>;
export interface Record extends BoxModelElements<number, number, number, number> {
    t: number;
}
export declare type IVPIntegrator = (y: ReadonlyArray<number>, x: number, h: number, derivatives: (y: ReadonlyArray<number>, x: number) => number[]) => number[];
export interface BoxModelOptions {
    integrator: IVPIntegrator;
}
//# sourceMappingURL=types.d.ts.map