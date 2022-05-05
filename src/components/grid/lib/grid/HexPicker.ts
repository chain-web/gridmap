import { DGrid } from "./DGrid";

// 待补充，不知道是干啥的
export class HexPicker {
  constructor () {
      this._keylen = 4
  }
  private _keylen
  public exchangeIJ(dg: DGrid): DGrid {
    const dGrid = new DGrid(dg.layer, dg.face, dg.j, dg.i);
    return dGrid;
  }

  // 在八面体中翻转faceid
  // 映射为自己同侧的对面
  public flipFaceId(faceID: number): number {
    if (faceID > 3) {
      faceID -= 4;
    } else if (faceID < 4) {
      faceID += 4;
    }

    return faceID;
  }

  public flipDGrid(dg: DGrid): number {
    return this.flipFaceId(dg.face);
  }

  // 对一个faceid在八面体中进行翻面
  // 当前面转到左侧相邻面
  // 如果westToEast为true，则转到右侧相邻面
  public rotateFaceInd(
    faceInd: number,
    westToEast: boolean,
    nTimes: number
  ): number {
    if (nTimes == 1) {
      if (westToEast) {
        ++faceInd;
        if (faceInd == 4) {
          faceInd = 0;
        }

        if (faceInd == 8) {
          faceInd = 4;
        }
      } else {
        --faceInd;
        if (faceInd == -1) {
          faceInd = 3;
        } else if (faceInd == 3) {
          faceInd = 7;
        }
      }
    } else {
      for (let i = 0; i < nTimes; ++i) {
        faceInd = this.rotateFaceInd(faceInd, westToEast, 1);
      }
    }

    return faceInd;
  }
  // 对grid进行翻面操作，并返回翻面之后的新grid
  public rotateDGrid(dg: DGrid, westToEast: boolean, nTimes: number): DGrid {
    const faceInd: number = this.rotateFaceInd(dg.face, westToEast, nTimes);
    const dGrid = new DGrid(dg.layer, faceInd, dg.i, dg.j);
    return dGrid;
  }

  // 对一个faceid在八面体中进行镜像
  public mirrorFaceInd(
    faceInd: number,
    westToEast: boolean,
    nTimes: number
  ): number {
    return this.rotateFaceInd(faceInd, westToEast, nTimes);
  }

  // 对grid进行镜像，并返回镜像之后的新grid
  public mirrorDGrid(dg: DGrid, westToEast: boolean, nTimes: number): DGrid {
    // 先旋转
    dg = this.rotateDGrid(dg, westToEast, nTimes);
    // 再换IJ?????????
    // 不懂
    if (nTimes % 2 == 1) {
      dg = this.exchangeIJ(dg);
    }

    return dg;
  }

  // 翻转为自己穿过八面体中心，正对的那个面
  public symmetryFaceInd(faceInd: number): number {
    const f: number = this.flipFaceId(faceInd);
    return this.rotateFaceInd(f, true, 2);
  }

  // 这里就是调用了上面方法？？
  // 应该返回新的DGrid吧
  public symmetryDGrid(dg: DGrid): number {
    return this.symmetryFaceInd(dg.face);
  }

  // 对DGrid进行去重
  public uniqueIndex(indexes: DGrid[]): DGrid[] {
    const newListObj = {} as { [key: string]: DGrid };
    indexes.forEach((ele) => {
      newListObj[ele.toString()] = ele;
    });

    return Object.keys(newListObj).map((ele) => newListObj[ele]);
  }

  get keylen(): number {
    return this._keylen;
  }

  set keylen(k: number) {
    this._keylen = k;
  }
}
