import { CoordinatorUtil } from "../CoordinatorUtil";
import { GeoGeometry } from "../GeoGeometry";
import { DGrid } from "./DGrid";
import { GeoCoord } from "./GeoCoord";
import { Hex } from "./Hex";
import { HexCellGenerator } from "./HexCellGenerator";
import { KeyCoder } from "./keyCoder";
import { OctEarth } from "./OctEarth";

//  计算格子数据，入口逻辑
export class Calculator {
  private keyCoder: KeyCoder = new KeyCoder();
  private octEarth: OctEarth = new OctEarth();

  public setLayer(layer: number): void {
    this.octEarth.setLayer(layer);
  }

  public hexCellKey(geoPos: GeoCoord): string {
    const index: DGrid = this.octEarth.hexIndex(geoPos, true);
    const key: string = this.keyCoder.encode(index);
    return key;
  }

  public hexCellNeighbor(hexKey: string, k: number): string[] {
    const index: DGrid | null = this.keyCoder.decode(hexKey);
    if (index === null) {
      console.warn("no decode msg");
      return [];
    }

    const neighbor: DGrid[] = this.octEarth.nearestNeighbor(index, k);
    const neighborkeys: string[] = this.keyCoder.encodes(neighbor);
    return neighborkeys;
  }

  // 获取当前hex格子以及周边k层的格子详细数据
  public hexCellBoudary(hexKey: string, k: number): Hex[] {
    const index = this.keyCoder.decode(hexKey);
    if (index === null) {
      console.warn("no decode msg");
      return [];
    }
    const boudary = this.octEarth.neighborLayer(index, k);
    const boudarykeys = this.keyCoder.encodes(boudary);
    // 流处理，待定
    return boudarykeys.map((ele) => this.getHexByKey(ele));
    // return boudarykeys.stream().map(this::getHex).collect(Collectors.toList());
    // return
  }
  public hexCellVertexesAndCenter(hexKey: string): GeoCoord[] {
    const dgrid = this.keyCoder.decode(hexKey);
    if (dgrid == null) {
      console.warn("no decode msg");
      return [];
    } else {
      const hcg: HexCellGenerator = new HexCellGenerator();
      hcg.setLayer(dgrid.layer);
      const vertexes: GeoCoord[] = hcg.hexCellVertexes(dgrid);
      const center: GeoCoord = hcg.hexCellCenter(dgrid);
      const res: GeoCoord[] = [...vertexes];
      // 最后一项是中心点
      res[vertexes.length] = center;
      return res;
    }
  }

  // 通过经纬度生成格子信息
  public getHexByLngLat(lng: number, lat: number): Hex {
    const wgs84Point = CoordinatorUtil.gcj02towgs84(lng, lat);
    const geoCoord: GeoCoord = new GeoCoord(wgs84Point[1], wgs84Point[0]);
    const key = this.hexCellKey(geoCoord);
    return this.getHexByKey(key);
  }

  // 通过hexid生成格子信息
  public getHexByKey(hexId: string): Hex {
    const points: GeoCoord[] = this.hexCellVertexesAndCenter(hexId);
    const polygon: number[][] = [];
    for (let i = 0; i < points.length - 1; i++) {
      // 不需要要最后一项中心点数据
      if (!polygon[i]) {
        polygon[i] = [];
      }
      polygon[i][0] = points[i].lng;
      polygon[i][1] = points[i].lat;
    }
    return new Hex(
      polygon,
      [points[points.length - 1].lng, points[points.length - 1].lat],
      hexId
    );
  }

  public polygon2HexList(polygon: number[][]): Hex[] {
    const center = GeoGeometry.polygonCenter(polygon);
    const centerHex: Hex = this.getHexByLngLat(center[0], center[1]);
    return this.getNearHexList(polygon, centerHex);
  }

  public polygon2HexDetalList(polygon: number[][]): Hex[] {
    const center = GeoGeometry.polygonCenter(polygon);
    const centerHex = this.getHexByLngLat(center[0], center[1]);
    return this.getNearHexList(polygon, centerHex);
  }

  private getNearHexList(polygon: number[][], startHex: Hex): Hex[] {
    const resultSet: Hex[] = [];
    const needProcess: { [key: string]: Hex } = {};
    // 队列
    const queue: Hex[] = [];
    queue.push(startHex);
    // 这里判断有改动，可能会出问题
    while (queue.length) {
      const currentHex = queue.shift();
      if (currentHex && this.polyContainsHex(polygon, currentHex)) {
        resultSet.push(currentHex);
        const neighbors: Hex[] = this.hexCellBoudary(currentHex.hexId, 1);
        neighbors.forEach((ele) => {
          if (!needProcess[ele.hexId]) {
            needProcess[ele.hexId] = ele;
            queue.push(ele);
          }
        });
      }
    }

    return resultSet;
  }

  private polyContainsHex(polygon: number[][], hex: Hex): boolean {
    const geoCoords: GeoCoord[] = this.hexCellVertexesAndCenter(hex.hexId);
    const wgsCenter: GeoCoord = geoCoords[geoCoords.length - 1];
    const gcj02Center: number[] = CoordinatorUtil.wgs84togcj02(
      wgsCenter.lng,
      wgsCenter.lat
    );
    return GeoGeometry.polygonContains(gcj02Center[1], gcj02Center[0], polygon);
  }

  // private  getPolygonCenterHex(double lng, double lat): string {
  //     double[] wgs84Point = CoordinatorUtil.gcj02towgs84(lng, lat);
  //     GeoCoord geoCoord = new GeoCoord(wgs84Point[1], wgs84Point[0]);
  //     return hexCellKey(geoCoord);
  // }

  // private  round(double value, int scale): number {
  //     BigDecimal bigDecimal = new BigDecimal(value);
  //     return bigDecimal.setScale(scale, BigDecimal.ROUND_DOWN).doubleValue();
  // }
}
