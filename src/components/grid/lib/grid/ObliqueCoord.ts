// 斜坐标系，基础类
export class ObliqueCoord {
  constructor(i: number, j: number, k: number) {
    this._i = i;
    this._j = j;
    this._k = k;
  }
  private _i;
  private _j;
  private _k;
  get i(): number {
    return this._i;
  }
  set i(i: number) {
    this._i = i;
  }
  get j(): number {
    return this._j;
  }
  set j(j: number) {
    this._j = j;
  }
  get k(): number {
    return this._k;
  }
  set k(k: number) {
    this._k = k;
  }
  public toString(): string {
    return ObliqueCoord.encode(this._i, this._j, this._k);
  }
  public static encode(i: number, j: number, k: number) {
    return `ObliqCoord_${i}_i${j}_j${k}_k`;
  }
}
