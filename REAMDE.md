# box-model

This package provides an engine for running simulation on so-called mathematical box-models.

## Install

`npm install @imaginary-maths/box-model`

## Usage

A _box model_ consists of:

- A series of _stocks_ or containers of the quantity we want to model (e.g. energy, but could be money, people, etc).
- A series of _flows_ or arrows that transfer the quantity in and out the stocks, according to some physical laws or given formulas.
- Some _variables_ or values that depend on other values according to certain formulas.
- Some _parameters_ or values that we are free to adjust.

These have to be defined using the (TypeScript) data types `Stocks`, `Flow`, `Variable` and `Parameter` and combined into a `BoxModel` (see [`src/types.ts`](src/types.ts)).

A simple example that models the energy balance of the earth depending on the albedo (while ignoring other major contributors) would be:

```ts
import {
  Stock,
  Flow,
  Variable,
  Parameter,
  BoxModel,
} from '@imaginary-maths/box-model';

const stocks: Stock[] = [
  {
    id: 'planet heat content',
    in: ['sun radiation'],
    out: ['reflected sun radiation', 'earth infrared radiation'],
  },
];

const flows: Flow[] = [
  {
    id: 'sun radiation',
    formula: ({ p }: { p: LookupFunction }) => p('solar emissivity') / 4,
  },
  {
    id: 'reflected sun radiation',
    formula: ({ p }: { p: LookupFunction }) =>
      (p('solar emissivity') * p('albedo')) / 4,
  },
  {
    id: 'earth infrared radiation',
    formula: ({ v }: { v: LookupFunction }) => 5.67e-8 * v('temperature') ** 4,
  },
];

const variables: Variable[] = [
  {
    id: 'temperature',
    formula: ({ s }: { s: LookupFunction }): number =>
      s('planet heat content') * 2.38e-10,
  },
];

const parameters: Parameter[] = [
  {
    id: 'albedo',
    value: 0.3,
  },
  {
    id: 'solar emissivity',
    value: 1367,
  },
];

const model: BoxModel = {
  stocks,
  flows,
  variables,
  paramters,
};
```

Now, the engine can be instantiated with the model:

```ts
import { BoxModelEngine } from '@imaginary-maths/box-model';

const engine = new BoxModelEngine(model);
```

Given initial values for the stocks, the engine can step the simulation forwards:

```ts
let stockValues = [1e12];
let t = 0;
let h = 60 * 60 * 24 * 365.2425; // one year in seconds

stockValues = engine.step(stockValues, t, h);
```

It is also possible to retrieve a `Record` that contains the values of all elements of the models:

```ts
let record = engine.stepExt(stockValue, t, h);
console.log(record.variables[0]); // prints current 'temperature'
```

Since accessing record elements through numeric indices can be a bit cumbersome, a utility function for creating an ID-based accessor is provided:

```ts
const varIdToIdxMap = BoxModelEngine.createIdToIdxMap(variables);
console.log(record.variables[varIdToIdxMap('temperature')]);
```

Internally, the `step` and `stepExt` functions traverse the graph, that is implicitly defined in the model, via the `evaluateGraph()` function. If the `stepExt` function is used, a full evaluation of this graph is returned to the user and the known flows at `t + h` can be reused to advance to `t + 2 * h`, avoiding duplicate computations:

```ts
record = engine.stepExt(stockValue, t, h);
let nextRecord = engine.stepExt(stockValue, record.flows, t + h, h);
```

### Formulas

In the flows and variables, a `Formula` can be any JavaScript function. The function parameters are `LookupFunction`s for each of the model elements: stocks `s`, flows `f`, variables `v`, parameters `p`. Calling a lookup function will retrieve the current value of this model element and, if necessary, traverse the model graph to compute this value. This may in turn require evaluation of other `Formula`s and will succeed if the evaluation graph is a tree. However, if the evaluation graph contains a cycle, a runtime exception will be thrown.

### Parameters

The only model elements that should be changed after initializing the engine are the values of the parameters, e.g. through `parameters[idx].value = newValue`. The change will be reflected upon the next call to one of step functions.

### Convergence

Some models converge on certain inputs initial values. The convenience methods
`converge()` and `convergeExt()` are provided for computing the converged state of the model for a given input:

```ts
import { ConvergenceCriterion } from '@imaginary-maths/box-model';

const criterion: ConvergenceCriterion = (
  r: Record, // the current record
  rPrevious: Record, // the previous record
  i: number, // iteration number
  bme: BoxModelEngine // reference to the engine
): boolean => {
  return i === 99; // stop after 100 iterations (i starts at 0)
};

const finalStocks = engine.converge(stockValues, t, h, criterion);
```

### Integrators

The engine currently support two types of integrators for advancing the simulation:

- `rk4`: Fourth-order Runge-Kutta method (default)
- `euler`: Euler method

These can be set during initialization of the engine as follows:

```ts
import { BoxModelEngine, euler } from './box-model';

const engine = BoxModelEngine(model, { integrator: euler });
```

Custom integrators can be defined following the `IVPIntegrator` signature.

### Notes

The library has been designed for ease of use and with easy definition of the model in mind encouraging experimentation with different models. However, processing speed was not the primary goal.

## Build

To build the library yourself, run

```
npm install
npm run build
```

Upon success, the updated build artifacts will be present in the [`dist`](dist) folder.

## Credits

Developed by Christian Stussak for IMAGINARY gGmbH.

## License

Copyright 2022 IMAGINARY gGmbH

Licensed under the MIT license (see the [`LICENSE`](LICENSE) file).
