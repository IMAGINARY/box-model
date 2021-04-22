import { BoxModel, BoxModelOptions, Record, IVPIntegrator } from './types';
declare type FlowGetter = (y: ReadonlyArray<number>, x: number) => number[];
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
    step(stocksAtT: number[], flowsAtT: number[], t: number, h: number): number[];
    private step3;
    private step4;
    protected stepImpl(stocksAtT: number[], getFlows: FlowGetter, t: number, h: number): number[];
    stepExt(stocksAtT: number[], t: number, h: number): Record;
    stepExt(stocksAtT: number[], flowsAtT: number[], t: number, h: number): Record;
    private stepExt3;
    private stepExt4;
}
export { BoxModelEngine };
//# sourceMappingURL=box-model.d.ts.map