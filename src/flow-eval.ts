import {
  BoxModel,
  LookupFunction,
  Formula,
  Flow,
  Variable,
  Record,
} from './types';
import { BoxModelEngine } from './box-model';
import {
  Flow as FlowV2,
  FlowGetter as FlowGetterV2,
} from './engine-implementation';
import { hasOwnProperty, throwLookupError } from './util';

function createBoxModelEvaluator(
  model: BoxModel
): (stocks: ReadonlyArray<number>, t: number) => Record {
  return new BoxModelEngine(model).createGraphEvaluator();
}

type EvaluationOrder = (
  | { type: 'flow'; element: Flow; index: number; array: Flow[] }
  | { type: 'variable'; element: Variable; index: number; array: Variable[] }
)[];

function computeFormulaEvaluationOrderExt(
  model: BoxModel,
  stocks: ReadonlyArray<number>,
  t: number
): { evaluationOrder: EvaluationOrder; record: Record } {
  const evaluationOrder: EvaluationOrder = [];

  const isFlowEvaluated = new Array<boolean>(model.flows.length).fill(false);
  const isVariableEvaluated = new Array<boolean>(model.variables.length).fill(
    false
  );

  const wrapElement = <T extends Flow | Variable>(
    type: 'flow' | 'variable',
    element: T,
    index: number,
    array: T[],
    isElementEvaluated: boolean[]
  ): Flow | Variable => {
    const { id, formula } = element;
    const wrappedFormula: Formula = (...params) => {
      if (isElementEvaluated[index])
        evaluationOrder.unshift({ type, element, index, array });
      isFlowEvaluated[index] = true;
      return formula(...params);
    };
    return { id, formula: wrappedFormula };
  };
  const wrapFlow = (element: Flow, index: number) =>
    wrapElement<Flow>('flow', element, index, model.flows, isFlowEvaluated);
  const wrapVariable = (element: Variable, index: number) =>
    wrapElement<Variable>(
      'variable',
      element,
      index,
      model.variables,
      isVariableEvaluated
    );

  const wrappedModel: BoxModel = {
    stocks: model.stocks,
    flows: model.flows.map(wrapFlow),
    variables: model.variables.map(wrapVariable),
    parameters: model.parameters,
  };

  const evaluator = new BoxModelEngine(wrappedModel).createGraphEvaluator();
  const record = evaluator(stocks, t);

  return { evaluationOrder, record };
}

function computeFormulaEvaluationOrder(
  model: BoxModel,
  stocks: ReadonlyArray<number>,
  t: number
): EvaluationOrder {
  return computeFormulaEvaluationOrderExt(model, stocks, t).evaluationOrder;
}

type BolModelElementKeySingular = 'stock' | 'flow' | 'variable' | 'parameter';
function createLookupFunction(
  type: BolModelElementKeySingular,
  values: number[],
  idToIdx: { [k: string]: number }
): LookupFunction {
  return (id: string) => {
    if (!hasOwnProperty(idToIdx, id)) throwLookupError(type, id);
    return values[idToIdx[id]];
  };
}

type Evaluator = (stocks: ReadonlyArray<number>, t: number) => Record;

function createEvaluatorFromEvaluationOrder(
  model: BoxModel,
  evaluationOrder: EvaluationOrder
): Evaluator {
  const { stocks: ms, flows: mf, variables: mv, parameters: mp } = model;

  const stockIdToIdx = BoxModelEngine.createIdToIdxMap(ms);
  const flowIdToIdx = BoxModelEngine.createIdToIdxMap(mf);
  const variableIdToIdx = BoxModelEngine.createIdToIdxMap(mv);
  const parameterIdToIdx = BoxModelEngine.createIdToIdxMap(mp);

  const evaluator = (stocks: ReadonlyArray<number>, t: number): Record => {
    const r: Record = {
      t: 0,
      stocks: stocks as number[],
      flows: new Array(model.flows.length) as number[],
      variables: new Array(mv.length) as number[],
      parameters: mp.map(({ value }) => value),
    };

    const s = createLookupFunction('stock', r.stocks, stockIdToIdx);
    const f = createLookupFunction('flow', r.flows, flowIdToIdx);
    const v = createLookupFunction('variable', r.variables, variableIdToIdx);
    const p = createLookupFunction('parameter', r.parameters, parameterIdToIdx);

    evaluationOrder.forEach(({ type, element, index }) => {
      switch (type) {
        case 'flow':
          r.flows[index] = element.formula({ s, f, v, p, t: r.t });
          break;
        case 'variable':
          r.variables[index] = element.formula({ s, f, v, p, t: r.t });
          break;
        default: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const error: never = type;
        }
      }
    });

    return r;
  };

  return evaluator;
}

function createEvaluatorExt(
  model: BoxModel,
  stocks: ReadonlyArray<number>,
  t: number
): {
  evaluator: (stocks: ReadonlyArray<number>, t: number) => Record;
  record: Record;
} {
  const evaluationOrderExt = computeFormulaEvaluationOrderExt(model, stocks, t);
  const { evaluationOrder, record } = evaluationOrderExt;
  const evaluator = createEvaluatorFromEvaluationOrder(model, evaluationOrder);
  return { record, evaluator };
}

function createEvaluator(
  model: BoxModel,
  stocks: ReadonlyArray<number>,
  t: number
): Evaluator {
  return createEvaluatorExt(model, stocks, t).evaluator;
}

function createFlowEvaluatorFromModelEvaluator(
  model: BoxModel,
  evaluator: Evaluator
): FlowGetterV2 {
  const flowIdToIdx = BoxModelEngine.createIdToIdxMap(model.flows);

  const flowTemplates = new Array<{ modelFlowIndex: number; flow: FlowV2 }>();

  model.stocks.forEach((stock, stockIndex) => {
    stock.out.forEach((flowId) => {
      const flowIndex = flowIdToIdx[flowId];
      flowTemplates.push({
        modelFlowIndex: flowIndex,
        flow: { value: 0.0, from: stockIndex, to: -1 },
      });
    });
    stock.in.forEach((flowId) => {
      const flowIndex = flowIdToIdx[flowId];
      flowTemplates.push({
        modelFlowIndex: flowIndex,
        flow: { value: 0.0, from: -1, to: stockIndex },
      });
    });
  });

  const flowEvaluator: FlowGetterV2 = (stocks, t): FlowV2[] => {
    const boxModelFlows = evaluator(stocks, t).flows;
    const flows = flowTemplates.map(({ modelFlowIndex, flow }) => ({
      ...flow,
      value: boxModelFlows[modelFlowIndex],
    }));
    return flows;
  };

  return flowEvaluator;
}
