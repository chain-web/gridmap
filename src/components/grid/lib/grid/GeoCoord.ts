// geo 基础类
export class GeoCoord {
  get lat(): number {
    return this._lat;
  }
  set lat(lat) {
    this._lat = lat;
  }

  get lng(): number {
    return this._lng;
  }
  set lng(lng) {
    this._lng = lng;
  }

  constructor(lat: number, lng: number) {
    this._lat = lat;
    this._lng = lng;
  }
  private _lat;
  private _lng;

  public toString(): string {
    return GeoCoord.encode(this._lat, this._lng);
  }

  public static encode(lat: number, lng: number) {
    return `GeoCoord_${lat}_lat${lng}_lng`;
  }
}
