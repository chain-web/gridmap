import type { ActionsI } from './';
export type { HexItem } from './lib/grid/Hex';

export enum HexMessageTypeI {
  hexAction = 'hexAction',
}

export interface HexMessageI<T extends actionTypes> {
  action: T;
  key: string;
  type: HexMessageTypeI;
  data: Parameters<ActionsI[T]>[0];
}
export type actionTypes = keyof ActionsI;
