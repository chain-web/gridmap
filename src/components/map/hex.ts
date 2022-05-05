import mapboxgl from 'mapbox-gl';
import { ActionsI, actionTypes, HexMessageTypeI } from '../grid';
import HexWorker from 'web-worker:../geo/index?worker';

export class HexService {
  constructor() {
    this.worker = new HexWorker();
    this.init();
  }
  private layer = 19;
  private worker: Worker;
  private msgQueue: { [key: string]: { resolve: (arg: any) => any } } = {};
  public setLayer(layer: number) {
    this.layer = layer;
  }
  public init() {
    this.worker.onmessage = (e) => {
      console.log(
        'worker call done:',
        e.data.action,
        ', use time:',
        Date.now() - e.data.key,
      );
      const { action, key, data } = e.data;
      if (this.msgQueue[key]) {
        this.msgQueue[key].resolve(data);
      }
    };
  }

  // 生成postMessage唯一ID
  public genMessageKey() {
    return Date.now().toString();
  }

  /**
   * @description 拼装调用worker进程的参数
   * @param key postmessage 唯一ID
   * @param action 要调用的action名称
   * @param data 传给 action 的参数
   * @returns 拼装好的信息
   */
  private genPostMsgData<T extends actionTypes>(
    key: string,
    action: T,
    data: Parameters<ActionsI[T]>[0],
  ) {
    return {
      key,
      type: HexMessageTypeI.hexAction,
      data,
      action,
    };
  }

  /**
   * @description 发起postMessage
   * @param action 要调用的action名称
   * @param data 传给 action 的参数
   */
  public async postMsg<T extends actionTypes>(
    action: T,
    data: Parameters<ActionsI[T]>[0],
  ): Promise<ReturnType<ActionsI[T]>> {
    const key = this.genMessageKey();
    this.worker.postMessage(this.genPostMsgData(key, action, data));
    return new Promise<ReturnType<ActionsI[T]>>((resolve, reject) => {
      this.msgQueue[key] = {
        resolve: (resData) => {
          resolve(resData);
        },
      };
    });
  }

  /**
   *
   * @param LngLat 经纬度坐标
   * @returns
   */
  public async genCurHex(LngLat: number[], radius: number = 220) {
    // const list = HexUtil.circle2Hex(LngLat[0], LngLat[1], 2000, 17);
    const list = await this.postMsg('getHexByCycle', {
      lng: LngLat[0],
      lat: LngLat[1],
      layer: this.layer,
      radius,
    });
    return list;
  }

  public async genHexByLngLat(LngLat: mapboxgl.LngLat) {
    const list = await this.postMsg('getHexByLngLat', {
      lng: LngLat.lng,
      lat: LngLat.lat,
      layer: this.layer,
    });
    return list;
  }
}

export const hexService = new HexService();
