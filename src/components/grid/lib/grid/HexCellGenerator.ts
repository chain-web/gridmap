import { D3Coordor } from "./D3Coordor";
import { DGrid } from "./DGrid";
import { FaceIndexCoord } from "./FaceIndexCoord";
import { GeoCoord } from "./GeoCoord";
import { OrthCoord } from "./OrthCoord";

export class HexCellGenerator {
  constructor() {
    this.vertexOffset["Vertex0DD"] = new FaceIndexCoord(
      HexCellGenerator.ONETHIRD,
      HexCellGenerator.ONETHIRD
    );
    this.vertexOffset["Vertex1RD"] = new FaceIndexCoord(
      -HexCellGenerator.ONETHIRD,
      2.0 * HexCellGenerator.ONETHIRD
    );
    this.vertexOffset["Vertex2RU"] = new FaceIndexCoord(
      -2.0 * HexCellGenerator.ONETHIRD,
      HexCellGenerator.ONETHIRD
    );
    this.vertexOffset["Vertex3UU"] = new FaceIndexCoord(
      -HexCellGenerator.ONETHIRD,
      -HexCellGenerator.ONETHIRD
    );
    this.vertexOffset["Vertex4LU"] = new FaceIndexCoord(
      HexCellGenerator.ONETHIRD,
      -2.0 * HexCellGenerator.ONETHIRD
    );
    this.vertexOffset["Vertex5LD"] = new FaceIndexCoord(
      2.0 * HexCellGenerator.ONETHIRD,
      -HexCellGenerator.ONETHIRD
    );
  }

  private static ONETHIRD = 0.3333333333333333;
  private vertexOffset: { [ket: string]: FaceIndexCoord } = {};
  private d3Coord: D3Coordor = new D3Coordor();
  private topAxis: OrthCoord = new OrthCoord(0.0, 1.0, 0.0);
  private leftAxis: OrthCoord = new OrthCoord(1.0, 0.0, 0.0);
  private rightAxis: OrthCoord = new OrthCoord(0.0, 0.0, 1.0);
  private layer: number = 0;
  private N: number = 0;

  // 初始化layer，坐标系
  public setLayer(layer: number) {
    this.layer = layer;
    this.N = Math.round(3.0 * Math.pow(2.0, layer - 1));
    this.leftAxis = new OrthCoord(0.0, -1.0 / this.N, 1.0 / this.N);
    this.rightAxis = new OrthCoord(1.0 / this.N, -1.0 / this.N, 0.0);
  }

  //
  public hexCellVertexes(hexGrid: DGrid): GeoCoord[] {
    if (
      (hexGrid.i == 0 && hexGrid.j == 0) ||
      (hexGrid.i == this.N && hexGrid.j == 0) ||
      (hexGrid.i == 0 && hexGrid.j == this.N)
    ) {
      return this.vertexesPolar(hexGrid);
    } else {
      return hexGrid.i != 0 && hexGrid.j != 0 && hexGrid.i + hexGrid.j != this.N
        ? this.vertexesInner(hexGrid)
        : this.vertexesEdge(hexGrid);
    }
  }

  public vertexesPolar(hexGrid: DGrid): GeoCoord[] {
    const vertexes: GeoCoord[] = [];
    const faceID = hexGrid.face;
    let index: FaceIndexCoord;
    let orthPos: OrthCoord;
    let geoPos: GeoCoord;
    if (hexGrid.i == 0 && hexGrid.j == 0) {
      index = this.getFaceIndex(hexGrid, "Vertex0DD");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[0] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[1] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[2] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[3] = new GeoCoord(geoPos.lat, geoPos.lng);
    } else if (hexGrid.i != 0) {
      index = this.getFaceIndex(hexGrid, "Vertex2RU");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[0] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, false, 1);
      vertexes[1] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.flip(geoPos);
      vertexes[2] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[3] = new GeoCoord(geoPos.lat, geoPos.lng);
    } else {
      index = this.getFaceIndex(hexGrid, "Vertex4LU");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[0] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.flip(geoPos);
      vertexes[1] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[2] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.flip(geoPos);
      vertexes[3] = new GeoCoord(geoPos.lat, geoPos.lng);
    }

    return vertexes;
  }

  public vertexesEdge(hexGrid: DGrid): GeoCoord[] {
    const vertexes: GeoCoord[] = [];
    const faceID = hexGrid.face;
    let index: FaceIndexCoord;
    let orthPos: OrthCoord;
    let geoPos: GeoCoord;
    if (hexGrid.j == 0) {
      index = this.getFaceIndex(hexGrid, "Vertex0DD");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[0] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, false, 1);
      vertexes[5] = new GeoCoord(geoPos.lat, geoPos.lng);
      index = this.getFaceIndex(hexGrid, "Vertex1RD");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[1] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, false, 1);
      vertexes[4] = new GeoCoord(geoPos.lat, geoPos.lng);
      index = this.getFaceIndex(hexGrid, "Vertex2RU");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[2] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, false, 1);
      vertexes[3] = new GeoCoord(geoPos.lat, geoPos.lng);
    } else if (hexGrid.i == 0) {
      index = this.getFaceIndex(hexGrid, "Vertex0DD");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[5] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[0] = new GeoCoord(geoPos.lat, geoPos.lng);
      index = this.getFaceIndex(hexGrid, "Vertex5LD");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[4] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[1] = new GeoCoord(geoPos.lat, geoPos.lng);
      index = this.getFaceIndex(hexGrid, "Vertex4LU");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[3] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.mirror(geoPos, true, 1);
      vertexes[2] = new GeoCoord(geoPos.lat, geoPos.lng);
    } else {
      index = this.getFaceIndex(hexGrid, "Vertex2RU");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[2] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.flip(geoPos);
      vertexes[1] = new GeoCoord(geoPos.lat, geoPos.lng);
      index = this.getFaceIndex(hexGrid, "Vertex3UU");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[3] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.flip(geoPos);
      vertexes[0] = new GeoCoord(geoPos.lat, geoPos.lng);
      index = this.getFaceIndex(hexGrid, "Vertex4LU");
      orthPos = this.getOrthPos(index);
      geoPos = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[4] = new GeoCoord(geoPos.lat, geoPos.lng);
      geoPos = this.flip(geoPos);
      vertexes[5] = new GeoCoord(geoPos.lat, geoPos.lng);
    }

    return vertexes;
  }

  public vertexesInner(hexGrid: DGrid): GeoCoord[] {
    const faceID = hexGrid.face;
    const VERLIST: string[] = [
      "Vertex0DD",
      "Vertex1RD",
      "Vertex2RU",
      "Vertex3UU",
      "Vertex4LU",
      "Vertex5LD",
    ];
    const vertexes: GeoCoord[] = [];

    for (let i = 0; i < VERLIST.length; ++i) {
      let index: FaceIndexCoord = this.getFaceIndex(hexGrid, VERLIST[i]);
      const orthPos: OrthCoord = this.getOrthPos(index);
      let geoPos: GeoCoord = this.d3Coord.orthToGeo(orthPos);
      geoPos = this.topology(geoPos, faceID);
      vertexes[i] = geoPos;
    }

    return vertexes;
  }

  public getFaceIndex(hexGrid: DGrid, vertexKey: string): FaceIndexCoord {
    const i = hexGrid.i + this.vertexOffset[vertexKey].i;
    const j = hexGrid.j + this.vertexOffset[vertexKey].j;
    return new FaceIndexCoord(i, j);
  }

  // 从面信息生成正笛卡尔坐标
  public getOrthPos(faceIndex: FaceIndexCoord): OrthCoord {
    const x =
      faceIndex.i * this.leftAxis.x +
      faceIndex.j * this.rightAxis.x +
      this.topAxis.x;
    const y =
      faceIndex.i * this.leftAxis.y +
      faceIndex.j * this.rightAxis.y +
      this.topAxis.y;
    const z =
      faceIndex.i * this.leftAxis.z +
      faceIndex.j * this.rightAxis.z +
      this.topAxis.z;
    return new OrthCoord(x, y, z);
  }
  // 拓扑
  public topology(pos: GeoCoord, faceID: number): GeoCoord {
    let geoPos = new GeoCoord(pos.lat, pos.lng);
    if (faceID >= 4) {
      faceID -= 4;
      geoPos = this.flip(pos);
    }

    return this.rotate(geoPos, true, faceID);
  }

  // 南北半球翻转
  public flip(geoPos: GeoCoord): GeoCoord {
    return new GeoCoord(-geoPos.lat, geoPos.lng);
  }

  // 旋转
  // 每次经度向右旋转1/4地球，90度
  public rotate(pos: GeoCoord, westToEast: boolean, nTimes: number): GeoCoord {
    let geoPos = new GeoCoord(pos.lat, pos.lng);
    if (nTimes == 1) {
      if (westToEast) {
        geoPos.lng = geoPos.lng + 90.0;
        // 超过+-180的极端数据处理
        if (geoPos.lng > 180.0) {
          console.warn("lng > 180");
          geoPos.lng = geoPos.lng - 360.0;
        }
      } else {
        geoPos.lng = geoPos.lng - 90.0;
        if (geoPos.lng < -180.0) {
          console.warn("lng < -180");
          geoPos.lng = geoPos.lng + 360.0;
        }
      }
    } else {
      for (let i = 0; i < nTimes; ++i) {
        geoPos = this.rotate(geoPos, westToEast, 1);
      }
    }

    return geoPos;
  }

  // 自己经度的镜像点，纬度不变
  public mirror(pos: GeoCoord, westToEast: boolean, nTimes: number): GeoCoord {
    let geoPos: GeoCoord = this.rotate(pos, westToEast, nTimes);
    if (nTimes % 2 == 1) {
      geoPos = this.exchangeIJ(geoPos);
    }
    return geoPos;
  }

  // 延球向右旋转90度
  public exchangeIJ(pos: GeoCoord): GeoCoord {
    const geoPos: GeoCoord = new GeoCoord(pos.lat, pos.lng);
    if (pos.lng >= 0.0) {
      if (geoPos.lng < 90.0) {
        geoPos.lng = 90.0 - geoPos.lng;
      } else {
        geoPos.lng = 270.0 - geoPos.lng;
      }
    } else if (geoPos.lng > -90.0) {
      geoPos.lng = -90.0 - geoPos.lng;
    } else {
      geoPos.lng = -270.0 - geoPos.lng;
    }

    return geoPos;
  }

  // public int faceID(GeoCoord geoPos) {
  //     double lat = geoPos.lat;
  //     double lon = geoPos.lng;
  //     int index;
  //     if (lon >= 0.0D) {
  //         if (lon <= 90.0D) {
  //             index = 0;
  //         } else {
  //             index = 1;
  //         }
  //     } else if (lon <= -90.0D) {
  //         index = 2;
  //     } else {
  //         index = 3;
  //     }

  //     if (lat < 0.0D) {
  //         index += 4;
  //     }

  //     return index;
  // }

  // public GeoCoord symmetry(GeoCoord pos) {
  //     GeoCoord geoPos = this.flip(pos);
  //     return this.rotate(geoPos, true, 2);
  // }

  public hexCellCenter(hexGrid: DGrid): GeoCoord {
    const index: FaceIndexCoord = new FaceIndexCoord(hexGrid.i, hexGrid.j);
    const orthPos: OrthCoord = this.getOrthPos(index);
    let geoPos: GeoCoord = this.d3Coord.orthToGeo(orthPos);
    geoPos = this.topology(geoPos, hexGrid.face);
    return geoPos;
  }
}
