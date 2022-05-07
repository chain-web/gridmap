import { GeoCoord } from "./GeoCoord";
import { OrthCoord } from "./OrthCoord";
import { SphereCoord } from "./SphereCoord";

// 三个坐标系之间的转换
export class D3Coordor {
  // dot = x^2 + y^2 + z^2
  public dot(pos: OrthCoord): number {
    return pos.x * pos.x + pos.y * pos.y + pos.z * pos.z;
  }

  // 直角坐标转求坐标
  // 计算精度？？？？？
  public orthToSphere(pos: OrthCoord): SphereCoord {
    const posDot: number = this.dot(pos);
    //  根号下x^2 + y^2 + z^2，径向
    const radial = Math.sqrt(posDot);
    const polar = Math.acos(pos.y / radial);
    let azim: number = 0.0;
    if (pos.z === 0.0) {
      // 没有高度
      if (pos.x >= 0.0) {
        azim = 1.5707963267948966;
      } else {
        azim = -1.5707963267948966;
      }
    } else {
      azim = Math.atan(pos.x / pos.z);
      if (pos.z < 0.0) {
        if (pos.x >= 0.0) {
          azim += 3.141592653589793;
        } else {
          azim = 3.141592653589793 - azim;
        }
      }
    }

    return new SphereCoord(radial, polar, azim);
  }

  // 求坐标转直角坐标
  // 计算精度？？？？？
  public sphereToOrth(pos: SphereCoord): OrthCoord {
    let y = pos.radial * Math.cos(pos.polar);
    let z = pos.radial * Math.sin(pos.polar) * Math.cos(pos.azim);
    let x = pos.radial * Math.sin(pos.polar) * Math.sin(pos.azim);
    x = (x * 1.0e15) / 1.0e15;
    y = (y * 1.0e15) / 1.0e15;
    z = (z * 1.0e15) / 1.0e15;
    return new OrthCoord(x, y, z);
  }

  // 球坐标转地理坐标
  public sphereToGeo(pos: SphereCoord): GeoCoord {
    const lat = 90.0 - pos.polar * 57.29577951308232;
    const lng = pos.azim * 57.29577951308232;
    return new GeoCoord(lat, lng);
  }

  // 地理坐标转球坐标
  public geoToSphere(pos: GeoCoord): SphereCoord {
    const polar = (90.0 - pos.lat) * 0.017453292519943295;
    const azim = pos.lng * 0.017453292519943295;
    return new SphereCoord(1.0, polar, azim);
  }

  // 直角坐标转地理坐标
  public orthToGeo(pos: OrthCoord): GeoCoord {
    const sprPos: SphereCoord = this.orthToSphere(pos);
    return this.sphereToGeo(sprPos);
  }

  // 地理坐标转直角坐标
  public geoToOrth(pos: GeoCoord): OrthCoord {
    const sprPos: SphereCoord = this.geoToSphere(pos);
    return this.sphereToOrth(sprPos);
  }
}
