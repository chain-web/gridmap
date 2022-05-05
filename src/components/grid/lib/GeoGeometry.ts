export class GeoGeometry {
  /**
   * 计算面积.
   *
   * @param polygon 点集合.
   * @return 面积.
   */
  public static area(polygon: number[][]): number {
    let total = 0.0;
    const center = this.polygonCenter(polygon);
    const xRef = center[0];
    const yRef = center[1];

    for (let i = 0; i < polygon.length; ++i) {
      const previous = polygon[i];
      const current = polygon[(i + 1) % polygon.length];
      const x1 =
        (previous[0] - xRef) *
        111319.49079327358 *
        Math.cos((yRef * 3.141592653589793) / 180.0);
      const y1 = (previous[1] - yRef) * this.toRadians(6378137.0);
      const x2 =
        (current[0] - xRef) *
        111319.49079327358 *
        Math.cos((yRef * 3.141592653589793) / 180.0);
      const y2 = (current[1] - yRef) * this.toRadians(6378137.0);
      total += x1 * y2 - x2 * y1;
    }

    return 0.5 * Math.abs(total);
  }
  /**
   * 计算中心点坐标.
   *
   * @param polygonPoints 点集合.
   * @return 中心点.
   */
  public static polygonCenter(polygonPoints: number[][]): number[] {
    let cumLon = 0.0;
    let cumLat = 0.0;
    const var5 = polygonPoints;
    const var6 = polygonPoints.length;

    for (let var7 = 0; var7 < var6; ++var7) {
      const coordinate = var5[var7];
      cumLon += coordinate[0];
      cumLat += coordinate[1];
    }
    if (polygonPoints.length == 0) {
      return [-1, -1];
    }
    return [cumLon / polygonPoints.length, cumLat / polygonPoints.length];
  }

  /**
   * 获取圆边区域点.
   *
   * @param segments  点数量.
   * @param longitude 经度.
   * @param latitude  纬度.
   * @param radius    半径.
   * @return 点集合.
   */
  public static circle2polygon(
    segments: number,
    longitude: number,
    latitude: number,
    radius: number
  ): number[][] {
    this.validate(longitude, latitude, false);
    if (segments < 5) {
      throw new Error("you need a minimum of 5 segments");
    } else {
      const points: number[][] = [];
      const relativeLatitude =
        ((radius / 6371000.0) * 180.0) / 3.141592653589793;
      const relativeLongitude =
        (relativeLatitude / Math.cos(this.toRadians(latitude))) % 90.0;

      for (let i = 0; i < segments; ++i) {
        let theta = (6.283185307179586 * i) / segments;
        theta = theta += 0.1;
        if (theta >= 6.283185307179586) {
          theta -= 6.283185307179586;
        }

        let latOnCircle = latitude + relativeLatitude * Math.sin(theta);
        let lonOnCircle = longitude + relativeLongitude * Math.cos(theta);
        if (lonOnCircle > 180.0) {
          lonOnCircle = -180.0 + (lonOnCircle - 180.0);
        } else if (lonOnCircle < -180.0) {
          lonOnCircle = 180.0 - (lonOnCircle + 180.0);
        }

        if (latOnCircle > 90.0) {
          latOnCircle = 90.0 - (latOnCircle - 90.0);
        } else if (latOnCircle < -90.0) {
          latOnCircle = -90.0 - (latOnCircle + 90.0);
        }

        points[i] = [lonOnCircle, latOnCircle];
      }

      return points;
    }
  }

  /**
   * 校验经纬度.
   *
   * @param longitude 经度.
   * @param latitude  纬度.
   * @param strict    strict.
   */
  public static validate(longitude: number, latitude: number, strict: boolean) {
    let roundedLat = latitude;
    let roundedLon = longitude;
    if (!strict) {
      roundedLat = Math.round(latitude * 1000000.0) / 1000000.0;
      roundedLon = Math.round(longitude * 1000000.0) / 1000000.0;
    }

    if (roundedLat >= -90.0 && roundedLat <= 90.0) {
      if (roundedLon < -180.0 || roundedLon > 180.0) {
        throw new Error(
          "Longitude " + longitude + " is outside legal range of -180,180"
        );
      }
    } else {
      throw new Error(
        "Latitude " + latitude + " is outside legal range of -90,90"
      );
    }
  }
  //     /**
  //      * 围栏判定
  //      *
  //      * @param latitude
  //      * @param longitude
  //      * @param polygonPoints
  //      * @return
  //      */
  static polygonContains(
    latitude: number,
    longitude: number,
    polygonPoints: number[][]
  ): boolean {
    // 校验经纬度
    this.validate(longitude, latitude, false);

    if (polygonPoints.length <= 2) {
      throw new Error("a polygon must have at least three points");
    }

    const bbox = this.boundingBox(polygonPoints);
    if (!this.bboxContains(bbox, latitude, longitude)) {
      // outside the containing bbox
      return false;
    }

    let hits = 0;
    let lastLatitude = polygonPoints[polygonPoints.length - 1][1];
    let lastLongitude = polygonPoints[polygonPoints.length - 1][0];
    let currentLatitude, currentLongitude;

    // Walk the edges of the polygon
    for (
      let i = 0;
      i < polygonPoints.length;
      lastLatitude = currentLatitude, lastLongitude = currentLongitude, i++
    ) {
      currentLatitude = polygonPoints[i][1];
      currentLongitude = polygonPoints[i][0];

      if (currentLongitude == lastLongitude) {
        continue;
      }

      let leftLatitude;
      if (currentLatitude < lastLatitude) {
        if (latitude >= lastLatitude) {
          continue;
        }
        leftLatitude = currentLatitude;
      } else {
        if (latitude >= currentLatitude) {
          continue;
        }
        leftLatitude = lastLatitude;
      }

      let test1, test2;
      if (currentLongitude < lastLongitude) {
        if (longitude < currentLongitude || longitude >= lastLongitude) {
          continue;
        }
        if (latitude < leftLatitude) {
          hits++;
          continue;
        }
        test1 = latitude - currentLatitude;
        test2 = longitude - currentLongitude;
      } else {
        if (longitude < lastLongitude || longitude >= currentLongitude) {
          continue;
        }
        if (latitude < leftLatitude) {
          hits++;
          continue;
        }
        test1 = latitude - lastLatitude;
        test2 = longitude - lastLongitude;
      }

      if (
        test1 <
        (test2 / (lastLongitude - currentLongitude)) *
          (lastLatitude - currentLatitude)
      ) {
        hits++;
      }
    }
    return (hits & 1) != 0;
  }

  // 四个方向的最远边界点
  // 这个计算量，会不会爆炸
  public static boundingBox(lineString: number[][]): number[] {
    let minLat = Number.MAX_VALUE;
    let minLon = Number.MAX_VALUE;
    let maxLat = Number.MIN_VALUE;
    let maxLon = Number.MIN_VALUE;

    for (let i = 0; i < lineString.length; i++) {
      minLat = Math.min(minLat, lineString[i][1]);
      minLon = Math.min(minLon, lineString[i][0]);
      maxLat = Math.max(maxLat, lineString[i][1]);
      maxLon = Math.max(maxLon, lineString[i][0]);
    }

    return [minLat, maxLat, minLon, maxLon];
  }

  /**
   * @param bbox      double array of [minLat,maxLat,minLon,maxLon}
   * @param latitude  latitude
   * @param longitude longitude
   * @return 当前点是否在盒子内
   */
  public static bboxContains(
    bbox: number[],
    latitude: number,
    longitude: number
  ): boolean {
    this.validate(longitude, latitude, false);
    return (
      bbox[0] <= latitude &&
      latitude <= bbox[1] &&
      bbox[2] <= longitude &&
      longitude <= bbox[3]
    );
  }
  public static toRadians = (deg: number): number => {
    return deg * (Math.PI / 180);
  };
}

/**
 * GeoGeometry.java
 *
 */
// @Slf4j
// public class GeoGeometry1 {

//     /**
//      * Translate a point by the specified meters along the longitude and latitude. Note, this method
//      * assumes the earth is a sphere and the result is not going to be very precise for larger
//      * distances.
//      *
//      * @param latitude         latitude
//      * @param longitude        longitude
//      * @param latitudalMeters  distance in meters that the point should be translated along the
//      *                         latitude
//      * @param longitudalMeters distance in meters that the point should be translated along the
//      *                         longitude
//      * @return the translated coordinate.
//      */
//     public static double[] translate(double latitude, double longitude, double latitudalMeters,
//                                      double longitudalMeters) {
//         validate(latitude, longitude, false);
//         double[] longitudal = translateLongitude(latitude, longitude, longitudalMeters);
//         return translateLatitude(longitudal[1], longitudal[0], latitudalMeters);
//     }

//     public static double distance(double lat1, double long1, double lat2, double long2) {
//         validate(long1, lat1, false);
//         validate(long2, lat2, false);
//         double deltaLat = Math.toRadians(lat2 - lat1);
//         double deltaLon = Math.toRadians(long2 - long1);
//         double a = Math.sin(deltaLat / 2.0D) * Math.sin(deltaLat / 2.0D) + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.sin(deltaLon / 2.0D) * Math.sin(deltaLon / 2.0D);
//         double c = 2.0D * Math.asin(Math.sqrt(a));
//         return 6371000.0D * c;
//     }

//     public static double[] translateLongitude(double latitude, double longitude, double meters) {
//         validate(longitude, latitude, false);
//         return new double[]{roundToDecimals(longitude + meters / lengthOfLongitudeDegreeAtLatitude(latitude), 6), latitude};
//     }

//     public static double[] translateLatitude(double latitude, double longitude, double meters) {
//         return new double[]{longitude, roundToDecimals(latitude + meters / 111194.92664455873D, 6)};
//     }

//     public static double roundToDecimals(double d, int decimals) {
//         if (decimals > 17) {
//             throw new IllegalArgumentException("this probably doesn't do what you want; makes sense only for <= 17 decimals");
//         } else {
//             double factor = Math.pow(10.0D, (double) decimals);
//             return (double) Math.round(d * factor) / factor;
//         }
//     }

//     private static double lengthOfLongitudeDegreeAtLatitude(double latitude) {
//         double latitudeInRadians = Math.toRadians(latitude);
//         return Math.cos(latitudeInRadians) * 4.003017359204114E7D / 360.0D;
//     }

//     public static boolean polygonContains(double latitude, double longitude,
//                                           double[]... polygonPoints) {
//         validate(longitude, latitude, false);

//         if (polygonPoints.length <= 2) {
//             throw new IllegalArgumentException("a polygon must have at least three points");
//         }

//         double[] bbox = boundingBox(polygonPoints);
//         if (!bboxContains(bbox, latitude, longitude)) {
//             // outside the containing bbox
//             return false;
//         }

//         int hits = 0;

//         double lastLatitude = polygonPoints[polygonPoints.length - 1][1];
//         double lastLongitude = polygonPoints[polygonPoints.length - 1][0];
//         double currentLatitude, currentLongitude;

//         // Walk the edges of the polygon
//         for (int i = 0; i < polygonPoints.length; lastLatitude = currentLatitude, lastLongitude =
//                 currentLongitude, i++) {
//             currentLatitude = polygonPoints[i][1];
//             currentLongitude = polygonPoints[i][0];

//             if (currentLongitude == lastLongitude) {
//                 continue;
//             }

//             double leftLatitude;
//             if (currentLatitude < lastLatitude) {
//                 if (latitude >= lastLatitude) {
//                     continue;
//                 }
//                 leftLatitude = currentLatitude;
//             } else {
//                 if (latitude >= currentLatitude) {
//                     continue;
//                 }
//                 leftLatitude = lastLatitude;
//             }

//             double test1, test2;
//             if (currentLongitude < lastLongitude) {
//                 if (longitude < currentLongitude || longitude >= lastLongitude) {
//                     continue;
//                 }
//                 if (latitude < leftLatitude) {
//                     hits++;
//                     continue;
//                 }
//                 test1 = latitude - currentLatitude;
//                 test2 = longitude - currentLongitude;
//             } else {
//                 if (longitude < lastLongitude || longitude >= currentLongitude) {
//                     continue;
//                 }
//                 if (latitude < leftLatitude) {
//                     hits++;
//                     continue;
//                 }
//                 test1 = latitude - lastLatitude;
//                 test2 = longitude - lastLongitude;
//             }

//             if (test1 < test2 / (lastLongitude - currentLongitude) * (lastLatitude - currentLatitude)) {
//                 hits++;
//             }
//         }

//         return (hits & 1) != 0;
//     }

//     /**
//      * Check if the lines defined by (x1,y1) (x2,y2) and (u1,v1) (u2,v2) cross each other or not.
//      *
//      * @param x1 double
//      * @param y1 double
//      * @param x2 double
//      * @param y2 double
//      * @param u1 double
//      * @param v1 double
//      * @param u2 double
//      * @param v2 double
//      * @return true if they cross each other
//      */
//     public static boolean linesCross(double x1, double y1, double x2, double y2, double u1,
//                                      double v1, double u2, double v2) {
//         // formula for line: y= a+bx

//         // vertical lines result in a divide by 0;
//         boolean line1Vertical = x2 == x1;
//         boolean line2Vertical = u2 == u1;
//         if (line1Vertical && line2Vertical) {
//             // x=a
//             if (x1 == u1) {
//                 // lines are the same
//                 return y1 <= v1 && v1 < y2 || y1 <= v2 && v2 < y2;
//             } else {
//                 // parallel -> they don't intersect!
//                 return false;
//             }
//         } else if (line1Vertical && !line2Vertical) {
//             double b2 = (v2 - v1) / (u2 - u1);
//             double a2 = v1 - b2 * u1;

//             double xi = x1;
//             double yi = a2 + b2 * xi;

//             return yi >= y1 && yi <= y2;

//         } else if (!line1Vertical && line2Vertical) {
//             double b1 = (y2 - y1) / (x2 - x1);
//             double a1 = y1 - b1 * x1;

//             double xi = u1;
//             double yi = a1 + b1 * xi;

//             return yi >= v1 && yi <= v2;
//         } else {

//             double b1 = (y2 - y1) / (x2 - x1);
//             // divide by zero if second line vertical
//             double b2 = (v2 - v1) / (u2 - u1);

//             double a1 = y1 - b1 * x1;
//             double a2 = v1 - b2 * u1;

//             if (b1 - b2 == 0) {
//                 if (Math.abs(a1 - a2) < .0000001) {
//                     // lines are the same
//                     return x1 <= u1 && u1 < x2 || x1 <= u2 && u2 < x2;
//                 } else {
//                     // parallel -> they don't intersect!
//                     return false;
//                 }
//             }
//             // calculate intersection point xi,yi
//             double xi = -(a1 - a2) / (b1 - b2);
//             double yi = a1 + b1 * xi;
//             if ((x1 - xi) * (xi - x2) >= 0 && (u1 - xi) * (xi - u2) >= 0 && (y1 - yi) * (yi - y2) >= 0
//                     && (v1 - yi) * (yi - v2) >= 0) {
//                 return true;
//             } else {
//                 return false;
//             }
//         }
//     }

// }
