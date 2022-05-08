// 斜坐标系，基础类
export class Hex {
  constructor(polygon: number[][], center: number[], hexId: string) {
    this._polygon = polygon;
    this._center = center;
    this._hexId = hexId;
  }
  private _polygon: number[][];
  private _center: number[];
  private _hexId: string;
  get polygon(): number[][] {
    return this._polygon;
  }
  set polygon(polygon: number[][]) {
    this._polygon = polygon;
  }
  get center(): number[] {
    return this._center;
  }
  set center(center: number[]) {
    this._center = center;
  }
  get hexId(): string {
    return this._hexId;
  }
  set hexId(hexId: string) {
    this._hexId = hexId;
  }

  toJson() {
    return {
      hexid: this._hexId,
      center: this._center,
      polygon: this._polygon,
    };
  }
}

export type HexItem = ReturnType<Hex['toJson']>;
