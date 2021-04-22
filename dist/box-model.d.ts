import { IVPIntegrator, euler, rk4 } from './ode';
export { IVPIntegrator, euler, rk4 };
declare type LookupFunction = (id: string) => number;
export declare type Formula = (s: LookupFunction, f: LookupFunction, v: LookupFunction, c: LookupFunction, t: number) => number;
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
export default class BoxModel {
    readonly stocks: ReadonlyArray<Stock>;
    readonly flows: ReadonlyArray<Flow>;
    readonly variables: ReadonlyArray<Variable>;
    readonly parameters: ReadonlyArray<Parameter>;
    integrator: IVPIntegrator;
    protected idToIdx: {
        [key: string]: number;
    };
    constructor({ stocks, flows, variables, parameters, }: {
        stocks: Stock[];
        flows: Flow[];
        variables: Variable[];
        parameters: Parameter[];
    }, integrator?: IVPIntegrator);
    protected ensureUniqueIds(): void;
    static createIdToIdxMap(arr: Array<{
        id: string;
    }>): {
        [key: string]: number;
    };
    evaluateGraph(stocks: number[], t: number): Record;
    step(stocksAtT: number[], t: number, h: number): number[];
    step(stocksAtT: number[], flowsAtT: number[], t: number, h: number): number[];
    private step3;
    private step4;
    protected stepImpl(stocksAtT: number[], getFlows: (y: number[], x: number) => number[], t: number, h: number): number[];
    stepExt(stocksAtT: number[], t: number, h: number): Record;
    stepExt(stocksAtT: number[], flowsAtT: number[], t: number, h: number): Record;
    private stepExt3;
    private stepExt4;
}
export { BoxModel };
//# sourceMappingURL=box-model.d.ts.map