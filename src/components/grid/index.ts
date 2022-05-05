import { Hex } from './lib/grid/Hex';
import { HexUtil } from './lib/HexUtil';

console.log('worker ------ init');

export type HexItem = ReturnType<Hex['toJson']>;

export enum HexMessageTypeI {
  hexAction = 'hexAction',
}

export interface HexMessageI<T extends actionTypes> {
  action: T;
  key: string;
  type: HexMessageTypeI;
  data: Parameters<ActionsI[T]>[0];
}
export type ActionsI = typeof actions;
export type actionTypes = keyof ActionsI;

const postMsg = <T extends actionTypes>(
  action: T,
  key: string,
  data: Parameters<ActionsI[T]>[0],
) => {
  postMessage({
    action,
    // 这里类型推导有问题？？？？？？
    data: actions[action](data as any),
    key,
  });
};

onmessage = <T extends actionTypes>(e: MessageEvent<HexMessageI<T>>) => {
  const { type, action, key, data } = e.data;
  if (type === HexMessageTypeI.hexAction && actions[action]) {
    console.log(`worker run: ${action}`);
    postMsg(action, key, data);
  }
};

const actions = {
  getHexByCycle: (data: {
    lng: Parameters<typeof HexUtil.circle2Hex>['0'];
    lat: Parameters<typeof HexUtil.circle2Hex>['1'];
    radius: Parameters<typeof HexUtil.circle2Hex>['2'];
    layer?: Parameters<typeof HexUtil.circle2Hex>['3'];
  }) => {
    return HexUtil.circle2Hex(data.lng, data.lat, data.radius, data.layer);
  },
  getHexIdByLngLat: (data: {
    lng: Parameters<typeof HexUtil.coords2Hex>['0'];
    lat: Parameters<typeof HexUtil.coords2Hex>['1'];
    layer?: Parameters<typeof HexUtil.coords2Hex>['2'];
  }) => {
    return HexUtil.coords2Hex(data.lng, data.lat, data.layer);
  },
  getHexByLngLat: (data: {
    lng: Parameters<typeof HexUtil.coords2Hex>['0'];
    lat: Parameters<typeof HexUtil.coords2Hex>['1'];
    layer?: Parameters<typeof HexUtil.coords2Hex>['2'];
  }) => {
    return HexUtil.getHexByLngLat(data.lng, data.lat, data.layer);
  },
};
