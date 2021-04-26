import { NumericArray } from './types';
export declare function euler<T extends NumericArray>(y: T, x: number, h: number, derivatives: (y: T, x: number) => T): T;
export declare function rk4<T extends NumericArray>(y: T, x: number, h: number, derivatives: (y: T, x: number) => T): T;
//# sourceMappingURL=ode.d.ts.map