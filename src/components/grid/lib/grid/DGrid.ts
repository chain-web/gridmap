// DGrid 基础数据结构
export class DGrid {
  constructor(layer: number, face: number, i: number, j: number) {
    this._layer = layer;
    this._face = face;
    this._i = i;
    this._j = j;
  }

  private _layer;
  private _face;
  private _i;
  private _j;

  get layer() {
    return this._layer;
  }
  set layer(layer: number) {
    this._layer = layer;
  }
  get face() {
    return this._face;
  }
  set face(face: number) {
    this._face = face;
  }
  get i() {
    return this._i;
  }
  set i(i: number) {
    this._i = i;
  }
  get j() {
    return this._j;
  }
  set j(j: number) {
    this._j = j;
  }
  public toString() {
    return DGrid.encode(this._layer, this._face, this._i, this._j);
  }
  public static encode(layer: number, face: number, i: number, j: number) {
    // B 八面体
    // C 层级
    // M 面
    // x，y点坐标
    return `BC${layer}M${face}x${i}y${j}`;
  }
}
