export function sum(arr: Array<number>): number {
  return arr.reduce((acc, cur) => acc + cur, 0);
}

export function sumIndirect(values: number[], indices: number[]) {
  return indices.map((i) => values[i]).reduce((acc, cur) => acc + cur, 0);
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const hasOwnPropertyFunc = Object.prototype.hasOwnProperty;
export function hasOwnProperty(
  o: Record<string, unknown>,
  key: string
): boolean {
  return hasOwnPropertyFunc.call(o, key);
}

export function throwLookupError(tableName: string, id: string) {
  throw new Error(
    `Value of unknown ${tableName} requested: ${id}. Check your box model definition.`
  );
}
