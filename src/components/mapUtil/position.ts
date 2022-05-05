import type mapboxgl from 'mapbox-gl';

export class PositionControl {
  constructor(map: mapboxgl.Map) {
    this.map = map;
  }
  map: mapboxgl.Map;
  currentPosition: [number, number];
  watchId: number;

  listenPostion = (): Promise<void> => {
    // 监听位置变化，地图跟随
    return new Promise((resolve, reject) => {
      this.watchId = navigator.geolocation.watchPosition(
        (res) => {
          this.handlePosition(res);
          resolve();
        },
        (err) => {
          console.log(err);
          reject(err);
        },
        { enableHighAccuracy: true },
      );
    });
  };

  initPostion = (): Promise<void> => {
    // 初始化获取位置，地图跟随
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (res) => {
          this.handlePosition(res);
          resolve();
        },
        (err) => {
          console.log(err);
          reject(err);
        },
        { enableHighAccuracy: true },
      );
    });
  };

  handlePosition = (res: GeolocationPosition): void => {
    const crd = res.coords;
    // console.log(crd);
    this.currentPosition = [crd.longitude, crd.latitude];
    this.map.setCenter([crd.longitude, crd.latitude]);
  };

  clearWatch = (): void => {
    navigator.geolocation.clearWatch(this.watchId);
  };

  init = async (): Promise<[number, number]> => {
    await this.initPostion();
    // console.log(this.currentPosition);
    return this.currentPosition;
  };
}
