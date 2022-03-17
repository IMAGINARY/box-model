import { BoxModel, BoxModelOptions, Record, IVPIntegrator } from './types';
declare type FlowGetter = (y: ReadonlyArray<number>, x: number) => ReadonlyArray<number>;
declare type ConvergenceCriterion = (r: Record, rPrevious: Record, i: number, bme: BoxModelEngine) => boolean;
export default class BoxModelEngine {
    model: BoxModel;
    integrator: IVPIntegrator;
    constructor(model: BoxModel, options?: BoxModelOptions);
    static createIdToIdxMap(arr: ReadonlyArray<{
        readonly id: string;
    }>): {
        [key: string]: number;
    };
    evaluateGraph(stocks: ReadonlyArray<number>, t: number): Record;
    step(stocksAtT: ReadonlyArray<number>, t: number, h: number): number[];
    step(stocksAtT: ReadonlyArray<number>, flowsAtT: ReadonlyArray<number>, t: number, h: number): number[];
    private step3;
    private step4;
    protected stepImpl(stocksAtT: ReadonlyArray<number>, getFlows: FlowGetter, t: number, h: number): number[];
    stepExt(stocksAtT: ReadonlyArray<number>, t: number, h: number): Record;
    stepExt(stocksAtT: ReadonlyArray<number>, flowsAtT: ReadonlyArray<number>, t: number, h: number): Record;
    private stepExt3;
    private stepExt4;
    converge(stocksAtT: ReadonlyArray<number>, t: number, h: number, criteria: ConvergenceCriterion): number[];
    convergeExt(stocksAtT: ReadonlyArray<number>, t: number, h: number, criterion: ConvergenceCriterion): Record;
}
export { BoxModelEngine, ConvergenceCriterion };
//# sourceMappingURL=box-model.d.ts.map