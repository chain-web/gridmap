import { CoordinatorUtil } from './CoordinatorUtil';
import { GeoGeometry } from './GeoGeometry';
import { Calculator } from './grid/Calculator';
import { GeoCoord } from './grid/GeoCoord';
import { Hex } from './grid/Hex';
/**
 * @ClassName HexUtil
 * @Description 六边形格子工具类
 * @Author scc
 * @Date 2021/9/30
 * @Version 0.1.0
 **/
export class HexUtil {
  public static layer: number = 13;
  /**
   * 经纬度转格子
   *
   * @param lng 精度
   * @param lat 维度
   * @return 格子ID
   */
  public static coords2Hex(lng: number, lat: number, layer?: number): string {
    const calculator: Calculator = new Calculator();
    calculator.setLayer(layer || this.layer);
    const geoCoord: GeoCoord = new GeoCoord(lat, lng);
    return calculator.hexCellKey(geoCoord);
  }

  //   通过格子id获取格子数据
  public static getHex(hexId: string, layer?: number): Hex {
    const calculator: Calculator = new Calculator();
    calculator.setLayer(layer || this.layer);
    return calculator.getHexByKey(hexId);
  }

  // 根据经纬度获取盒子信息
  public static getHexByLngLat(
    longitude: number,
    latitude: number,
    layer?: number,
  ): ReturnType<Hex['toJson']> {
    [longitude, latitude] = CoordinatorUtil.wgs84togcj02(longitude, latitude);
    const calculator: Calculator = new Calculator();
    calculator.setLayer(layer || this.layer);
    return calculator.getHexByLngLat(longitude, latitude).toJson();
  }

  //   获取地图上的一个原型区域的所有格子
  public static circle2Hex(
    longitude: number,
    latitude: number,
    radius: number,
    layer?: number,
  ): ReturnType<Hex['toJson']>[] {
    // 定位拿到的坐标一般是wgs84格式，在国内需要转换一下
    [longitude, latitude] = CoordinatorUtil.wgs84togcj02(longitude, latitude);
    const polygon = GeoGeometry.circle2polygon(36, longitude, latitude, radius);
    const calc: Calculator = new Calculator();
    calc.setLayer(layer || this.layer);
    return calc.polygon2HexList(polygon).map((ele) => ele.toJson());
  }
  // 获取围栏内的格子
  public static polygon2Hex(polygon: number[][], layer?: number): Hex[] {
    const calc = new Calculator();
    calc.setLayer(layer || this.layer);
    return calc.polygon2HexList(polygon);
  }

  // private static double round(double value, int scale) {
  //     BigDecimal bigDecimal = new BigDecimal(value);
  //     return bigDecimal.setScale(scale, BigDecimal.ROUND_DOWN).doubleValue();
  // }

  // public static void main(String[] args) {
  //     // 经纬度转格子
  //     String key = coords2Hex(120.55, 30.23);
  //     System.out.println(key);
  //     System.out.println(getHex(key));
  //     // 圆形围栏转格子
  //     List<Hex> hexs = circle2Hex(120.55, 30.23, 5000);
  //     System.out.println(hexs);

  //     System.out.println("--------------------");
  //     Hex hex1 = HexUtil.getHex("OL13F1i5038j2496");
  //     List<Hex> hexList1 = HexUtil
  //             .circle2Hex(hex1.getCenter()[0], hex1.getCenter()[1], 1366.134);
  // }
}
