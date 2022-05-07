// 地球三维坐标点，基础类
export class OrthCoord {
  constructor(x: number, y: number, z: number) {
    this._x = x;
    this._y = y;
    this._z = z;
  }
  private _x;
  private _y;
  private _z;
  get x(): number {
    return this._x;
  }
  set x(x: number) {
    this._x = x;
  }
  get y(): number {
    return this._y;
  }
  set y(y: number) {
    this._y = y;
  }
  get z(): number {
    return this._z;
  }
  set z(z: number) {
    this._z = z;
  }
  public toString(): string {
    return OrthCoord.encode(this._x, this._y, this._z);
  }
  public static encode(x: number, y: number, z: number) {
    return `OrthCoord_${x}_x${y}_y${z}_z`;
  }
}
