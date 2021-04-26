export declare type LookupFunction = (id: string) => number;
export declare type Formula = (s: LookupFunction, f: LookupFunction, v: LookupFunction, c: LookupFunction, t: number) => number;
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
export interface NumericArray {
    every(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): boolean;
    fill(value: number, start?: number, end?: number): this;
    filter(predicate: (value: number, index: number, array: this) => any, thisArg?: any): this;
    find(predicate: (value: number, index: number, obj: this) => boolean, thisArg?: any): number | undefined;
    findIndex(predicate: (value: number, index: number, obj: this) => boolean, thisArg?: any): number;
    forEach(callbackfn: (value: number, index: number, array: this) => void, thisArg?: any): void;
    indexOf(searchElement: number, fromIndex?: number): number;
    join(separator?: string): string;
    lastIndexOf(searchElement: number, fromIndex?: number): number;
    readonly length: number;
    map(callbackfn: (value: number, index: number, array: this) => number, thisArg?: any): this;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number, initialValue: number): number;
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue: U): U;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number, initialValue: number): number;
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue: U): U;
    reverse(): this;
    slice(start?: number, end?: number): this;
    some(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): boolean;
    sort(compareFn?: (a: number, b: number) => number): this;
    toLocaleString(): string;
    toString(): string;
    [index: number]: number;
}
export declare type IVPIntegrator<T extends NumericArray> = (y: T, x: number, h: number, derivatives: (y: T, x: number) => T) => number[];
export interface BoxModelOptions<T extends NumericArray> {
    integrator: IVPIntegrator<T>;
}
//# sourceMappingURL=types.d.ts.map