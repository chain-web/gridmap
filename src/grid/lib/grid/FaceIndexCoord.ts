// 面信息，基础类
export class FaceIndexCoord {
    constructor(i: number, j: number) {
      this._i = i;
      this._j = j;
    }
    private _i;
    private _j;
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
 
    public toString(): string {
      return FaceIndexCoord.encode(this._i, this._j);
    }
    public static encode(i: number, j: number) {
      return `FaceIndexCoord_${i}_i${j}_j`;
    }
  }

