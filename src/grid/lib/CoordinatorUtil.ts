// 经纬度坐标互相转换
export class CoordinatorUtil {
  private static x_pi = 52.35987755982988;
  private static pi = 3.141592653589793;
  private static a = 6378245.0;
  private static ee = 0.006693421622965943;

  public static gcj02tobd09(lng: number, lat: number): number[] {
    const z =
      Math.sqrt(lng * lng + lat * lat) +
      2.0e-5 * Math.sin(lat * 52.35987755982988);
    const theta =
      Math.atan2(lat, lng) + 3.0e-6 * Math.cos(lng * 52.35987755982988);
    const bd_lng = z * Math.cos(theta) + 0.0065;
    const bd_lat = z * Math.sin(theta) + 0.006;
    return [bd_lng, bd_lat];
  }

  public static bd09togcj02(bd_lon: number, bd_lat: number): number[] {
    const x = bd_lon - 0.0065;
    const y = bd_lat - 0.006;
    const z =
      Math.sqrt(x * x + y * y) - 2.0e-5 * Math.sin(y * 52.35987755982988);
    const theta = Math.atan2(y, x) - 3.0e-6 * Math.cos(x * 52.35987755982988);
    const gg_lng = z * Math.cos(theta);
    const gg_lat = z * Math.sin(theta);
    return [gg_lng, gg_lat];
  }

  public static wgs84togcj02(lng: number, lat: number): number[] {
    if (CoordinatorUtil.out_of_china(lng, lat)) {
      return [lng, lat];
    }
    let dlat = CoordinatorUtil.transformlat(lng - 105.0, lat - 35.0);
    let dlng = CoordinatorUtil.transformlng(lng - 105.0, lat - 35.0);
    const radlat = (lat / 180.0) * this.pi;
    let magic = Math.sin(radlat);
    magic = 1 - this.ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlat =
      (dlat * 180.0) /
      (((this.a * (1 - this.ee)) / (magic * sqrtmagic)) * this.pi);
    dlng = (dlng * 180.0) / ((this.a / sqrtmagic) * Math.cos(radlat) * this.pi);
    const mglat = lat + dlat;
    const mglng = lng + dlng;
    return [mglng, mglat];
  }

  public static out_of_china(lng: number, lat: number): boolean {
    if (lng < 72.004 || lng > 137.8347) {
      return true;
    } else if (lat < 0.8293 || lat > 55.8271) {
      return true;
    }
    return false;
  }

  public static gcj02towgs84(lng: number, lat: number): number[] {
    let dlat = CoordinatorUtil.transformlat(lng - 105.0, lat - 35.0);
    let dlng = CoordinatorUtil.transformlng(lng - 105.0, lat - 35.0);
    const radlat = (lat / 180.0) * 3.141592653589793;
    let magic = Math.sin(radlat);
    magic = 1.0 - 0.006693421622965943 * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlat =
      (dlat * 180.0) /
      ((6335552.717000426 / (magic * sqrtmagic)) * 3.141592653589793);
    dlng =
      (dlng * 180.0) /
      ((6378245.0 / sqrtmagic) * Math.cos(radlat) * 3.141592653589793);
    const mglat = lat + dlat;
    const mglng = lng + dlng;
    return [lng * 2.0 - mglng, lat * 2.0 - mglat];
  }

  public static transformlat(lng: number, lat: number): number {
    let ret =
      -100.0 +
      2.0 * lng +
      3.0 * lat +
      0.2 * lat * lat +
      0.1 * lng * lat +
      0.2 * Math.sqrt(Math.abs(lng));
    ret +=
      ((20.0 * Math.sin(6.0 * lng * 3.141592653589793) +
        20.0 * Math.sin(2.0 * lng * 3.141592653589793)) *
        2.0) /
      3.0;
    ret +=
      ((20.0 * Math.sin(lat * 3.141592653589793) +
        40.0 * Math.sin((lat / 3.0) * 3.141592653589793)) *
        2.0) /
      3.0;
    ret +=
      ((160.0 * Math.sin((lat / 12.0) * 3.141592653589793) +
        320.0 * Math.sin((lat * 3.141592653589793) / 30.0)) *
        2.0) /
      3.0;
    return ret;
  }

  public static transformlng(lng: number, lat: number): number {
    let ret =
      300.0 +
      lng +
      2.0 * lat +
      0.1 * lng * lng +
      0.1 * lng * lat +
      0.1 * Math.sqrt(Math.abs(lng));
    ret +=
      ((20.0 * Math.sin(6.0 * lng * 3.141592653589793) +
        20.0 * Math.sin(2.0 * lng * 3.141592653589793)) *
        2.0) /
      3.0;
    ret +=
      ((20.0 * Math.sin(lng * 3.141592653589793) +
        40.0 * Math.sin((lng / 3.0) * 3.141592653589793)) *
        2.0) /
      3.0;
    ret +=
      ((150.0 * Math.sin((lng / 12.0) * 3.141592653589793) +
        300.0 * Math.sin((lng / 30.0) * 3.141592653589793)) *
        2.0) /
      3.0;
    return ret;
  }
}
