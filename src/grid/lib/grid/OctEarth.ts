import { D3Coordor } from "./D3Coordor";
import { DGrid } from "./DGrid";
import { FaceIndexCoord } from "./FaceIndexCoord";
import { GeoCoord } from "./GeoCoord";
import { HexPicker } from "./HexPicker";
import { ObliqueCoord } from "./ObliqueCoord";
import { OrthCoord } from "./OrthCoord";

export class OctEarth {
  private n = 0;
  private cellLength = 0.0;
  private layer = 0;
  private hexPicker: HexPicker = new HexPicker();
  private d3Coord: D3Coordor = new D3Coordor();
  public isNearest(ii: number, jj: number): boolean {
    const a = ii + jj / 2.0;
    const b = jj + ii / 2.0;
    return a <= 0.5 && b <= 0.5;
  }

  public setLayer(layer: number): void {
    this.layer = layer;
    // 这里应该必是整数
    this.n = Math.round(3.0 * Math.pow(2.0, layer - 1));
  }

  // 生成faceID
  public faceID(geoPos: GeoCoord): number {
    const lat = geoPos.lat;
    const lon = geoPos.lng;
    let index;
    if (lon >= 0.0) {
      if (lon <= 90.0) {
        index = 0;
      } else {
        index = 1;
      }
    } else if (lon <= -90.0) {
      index = 2;
    } else {
      index = 3;
    }

    if (lat < 0.0) {
      index += 4;
    }

    return index;
  }

  // 地理坐标 初始化面信息？？？
  public facePos(pos: GeoCoord): GeoCoord {
    const geoPos: GeoCoord = new GeoCoord(pos.lat, pos.lng);
    if (geoPos.lng >= 0.0) {
      if (geoPos.lng > 90.0) {
        geoPos.lng = geoPos.lng - 90.0;
      }
    } else if (geoPos.lng <= -90.0) {
      geoPos.lng = geoPos.lng + 180.0;
    } else {
      geoPos.lng = geoPos.lng + 90.0;
    }

    if (geoPos.lat < 0.0) {
      geoPos.lat = -geoPos.lat;
    }

    return geoPos;
  }
  // 生成斜坐标系基础类
  public obliqueCoord(geoPos: GeoCoord): ObliqueCoord {
    const orthPos: OrthCoord = this.d3Coord.geoToOrth(geoPos);
    const s: number = orthPos.x + orthPos.y + orthPos.z;
    const k = (s - 1.0) / s;
    const j = orthPos.x * (1.0 - k) * this.n;
    const i = orthPos.z * (1.0 - k) * this.n;
    return new ObliqueCoord(i, j, k);
  }

  // 生成面基础类
  public faceCoord(geoPos: GeoCoord): FaceIndexCoord {
    const coord: ObliqueCoord = this.obliqueCoord(geoPos);
    return new FaceIndexCoord(coord.i, coord.j);
  }

  // 查找最近的面
  public nearestIndex(index: FaceIndexCoord): FaceIndexCoord {
    const i = Math.floor(index.i);
    const j = Math.floor(index.j);
    const ii = index.i - i;
    const jj = index.j - j;
    let fi = 0.0;
    let fj = 0.0;
    if (this.isNearest(ii, jj)) {
      fi = i;
      fj = j;
    } else if (this.isNearest(1.0 - ii, 1.0 - jj)) {
      fi = i + 1.0;
      fj = j + 1.0;
    } else if (ii > jj) {
      fi = i + 1.0;
      fj = j;
    } else {
      fi = i;
      fj = j + 1.0;
    }

    return new FaceIndexCoord(fi, fj);
  }

  // 从geo，生成格子信息
  public hexIndex(pos: GeoCoord, reduceSameIndex: boolean): DGrid {
    const frameIndex = this.faceID(pos);
    const geoPos: GeoCoord = this.facePos(pos);
    const index: FaceIndexCoord = this.faceCoord(geoPos);
    const nstIndex: FaceIndexCoord = this.nearestIndex(index);
    let hexIndex: DGrid = new DGrid(
      this.layer,
      frameIndex,
      nstIndex.i,
      nstIndex.j
    );
    if (reduceSameIndex) {
      hexIndex = this.adjustEdgeHexIndex(hexIndex);
    }

    return hexIndex;
  }
  public adjustEdgeHexIndex(dGrid: DGrid): DGrid {
    let dg: DGrid = new DGrid(dGrid.layer, dGrid.face, dGrid.i, dGrid.j);
    if (dg.i + dg.j === this.n && dg.face > 3) {
      dg.face = dg.face - 4;
    }

    if (dg.i == 0) {
      dg = this.hexPicker.mirrorDGrid(dg, true, 1);
    }

    if (dg.i == 0 && dg.j == 0) {
      if (dg.face < 4) {
        dg.face = 0;
      } else {
        dg.face = 4;
      }
    }

    return dg;
  }

  // 讲传入的k，变换成有效的k
  public effectiveEarthNeighborK(k: number): number {
    if (k < 0) {
      k = -k;
    }

    k %= 4 * this.n;
    if (k > 2 * this.n) {
      k = 4 * this.n - k;
    }

    return k;
  }

  // 查找k层相邻格子
  public unfoldNeighbor(hexIndex: DGrid, k: number): DGrid[] {
    const neighbor: DGrid[] = [];
    if (k <= 0) {
      return neighbor;
    } else {
      let kk = k;
      let ii = k;

      // 各个方向的k相邻
      let jj;
      for (jj = 0; jj > -kk - 1; --jj) {
        const dg = new DGrid(
          hexIndex.layer,
          hexIndex.face,
          hexIndex.i + ii,
          hexIndex.j + jj
        );
        neighbor.push(dg);
      }

      jj = -kk;

      for (ii = kk - 1; ii > -1; --ii) {
        const dg = new DGrid(
          hexIndex.layer,
          hexIndex.face,
          hexIndex.i + ii,
          hexIndex.j + jj
        );
        neighbor.push(dg);
      }

      for (ii = -1; ii > 1 - kk - 1; --ii) {
        jj = -kk - ii;
        const dg = new DGrid(
          hexIndex.layer,
          hexIndex.face,
          hexIndex.i + ii,
          hexIndex.j + jj
        );
        neighbor.push(dg);
      }

      ii = -kk;

      for (jj = 0; jj < kk + 1; ++jj) {
        const dg = new DGrid(
          hexIndex.layer,
          hexIndex.face,
          hexIndex.i + ii,
          hexIndex.j + jj
        );
        neighbor.push(dg);
      }

      jj = kk;

      for (ii = 1 - kk; ii < 1; ++ii) {
        const dg = new DGrid(
          hexIndex.layer,
          hexIndex.face,
          hexIndex.i + ii,
          hexIndex.j + jj
        );
        neighbor.push(dg);
      }

      for (ii = 1; ii < kk; ++ii) {
        jj = kk - ii;
        const dg = new DGrid(
          hexIndex.layer,
          hexIndex.face,
          hexIndex.i + ii,
          hexIndex.j + jj
        );
        neighbor.push(dg);
      }

      return neighbor;
    }
  }

  // 最佳faceID？？？？
  public topoFaceID(
    baseFace: number,
    topoFace: number,
    inverse: boolean
  ): number {
    let topoInd: number;
    if (baseFace == 0) {
      topoInd = topoFace;
    } else if (baseFace == 4) {
      topoInd = this.hexPicker.flipFaceId(topoFace);
    } else if (baseFace == 1) {
      topoInd = this.hexPicker.rotateFaceInd(topoFace, inverse, 1);
    } else if (baseFace == 5) {
      topoInd = this.hexPicker.flipFaceId(topoFace);
      topoInd = this.hexPicker.rotateFaceInd(topoInd, inverse, 1);
    } else if (baseFace == 2) {
      topoInd = this.hexPicker.rotateFaceInd(topoFace, true, 2);
    } else if (baseFace == 6) {
      topoInd = this.hexPicker.flipFaceId(topoFace);
      topoInd = this.hexPicker.rotateFaceInd(topoInd, true, 2);
    } else if (baseFace == 3) {
      topoInd = this.hexPicker.rotateFaceInd(topoFace, !inverse, 1);
    } else if (baseFace == 7) {
      topoInd = this.hexPicker.flipFaceId(topoFace);
      topoInd = this.hexPicker.rotateFaceInd(topoInd, !inverse, 1);
    } else {
      topoInd = -1;
    }

    return topoInd;
  }

  // 折叠最佳faceid
  public foldTopoFaceID(unfoldHexInde: DGrid): number {
    const i = unfoldHexInde.i;
    const j = unfoldHexInde.j;
    const n = this.n;
    // 没有注释，不可读
    if (i >= 0 && i <= n && j >= 0 && j <= n) {
      return i + j <= n ? 0 : 4;
    } else if (i > 0 && i <= n && j < 0 && j >= -n) {
      return i + j >= 0 ? 3 : 21;
    } else if (j > 0 && j <= n && i < 0 && i > -n) {
      return i + j >= 0 ? 1 : 22;
    } else if (i <= 0 && i >= -n && j <= 0 && j >= -n && i + j >= -n) {
      return 20;
    } else if (i > n && i <= 2 * n && j <= 0 && j >= -n) {
      return i + j < n ? 71 : 70;
    } else if (i > n && i < 2 * n && j > 0 && j < n && i + j <= 2 * n) {
      return 72;
    } else if (j > n && j <= 2 * n && i <= 0 && i >= -n) {
      return i + j < n ? 51 : 50;
    } else {
      return j > n && j < 2 * n && i > 0 && i < n && i + j <= 2 * n ? 52 : -1;
    }
  }

  // 折叠hex
  public foldHexIndex(index: DGrid): DGrid {
    let faceID = this.foldTopoFaceID(index);
    const fldIndex: DGrid = new DGrid(
      index.layer,
      index.face,
      index.i,
      index.j
    );
    const n = this.n;
    if (faceID == -1) {
      fldIndex.face = faceID;
      return fldIndex;
    } else {
      if (faceID != 0) {
        if (faceID == 4) {
          fldIndex.i = n - index.j;
          fldIndex.j = n - index.i;
        } else if (faceID == 1) {
          fldIndex.i = index.i + index.j;
          fldIndex.j = -index.i;
        } else if (faceID == 50) {
          fldIndex.i = 2 * n - index.j;
          fldIndex.j = -index.i;
          faceID = 5;
        } else if (faceID == 51) {
          fldIndex.i = index.i + n;
          fldIndex.j = n - index.i - index.j;
          faceID = 5;
        } else if (faceID == 52) {
          fldIndex.i = 2 * n - index.i - index.j;
          fldIndex.j = index.j - n;
          faceID = 5;
        } else if (faceID == 3) {
          fldIndex.i = -index.j;
          fldIndex.j = index.i + index.j;
        } else if (faceID == 70) {
          fldIndex.i = -index.j;
          fldIndex.j = 2 * n - index.i;
          faceID = 7;
        } else if (faceID == 71) {
          fldIndex.i = n - index.i - index.j;
          fldIndex.j = index.j + n;
          faceID = 7;
        } else if (faceID == 72) {
          fldIndex.i = index.i - n;
          fldIndex.j = 2 * n - index.i - index.j;
          faceID = 7;
        } else if (faceID == 20) {
          fldIndex.i = -index.i;
          fldIndex.j = -index.j;
          faceID = 2;
        } else if (faceID == 21) {
          fldIndex.i = -index.i - index.j;
          fldIndex.j = index.i;
          faceID = 2;
        } else if (faceID == 22) {
          fldIndex.i = index.j;
          fldIndex.j = -index.i - index.j;
          faceID = 2;
        }
      }

      const fldFaceInd: number = this.topoFaceID(index.face, faceID, true);
      fldIndex.face = fldFaceInd;
      return fldIndex;
    }
  }

  // 查找n层邻居格子
  public neighborLayer(hexIndex: DGrid, n: number): DGrid[] {
    const k = this.effectiveEarthNeighborK(n);
    const neighbor: DGrid[] = [];
    if (k == 0) {
      const dg = new DGrid(
        hexIndex.layer,
        hexIndex.face,
        hexIndex.i,
        hexIndex.j
      );
      neighbor.push();
      return neighbor;
    } else {
      const ufldNeighbor: DGrid[] = this.unfoldNeighbor(hexIndex, k);
      if (
        hexIndex.i > k &&
        hexIndex.j > k &&
        this.n - hexIndex.i - hexIndex.j > k
      ) {
        return ufldNeighbor;
      } else {
        ufldNeighbor.forEach((ele) => {
          let fldIndex = this.foldHexIndex(ele);
          if (fldIndex.face != -1) {
            fldIndex = this.adjustEdgeHexIndex(fldIndex);
            neighbor.push(fldIndex);
          }
        });

        return this.hexPicker.uniqueIndex(neighbor);
      }
    }
  }

  // 查找k层相邻格子
  public nearestNeighbor(hexIndex: DGrid, k: number): DGrid[] {
    const newK = this.effectiveEarthNeighborK(k);
    const neighbor: DGrid[] = [];

    for (let i = 0; i < newK + 1; ++i) {
      const iNeighbor: DGrid[] = this.neighborLayer(hexIndex, i);
      iNeighbor.forEach((ele) => {
        neighbor.push(ele);
      });
    }

    return this.hexPicker.uniqueIndex(neighbor);
  }
}
