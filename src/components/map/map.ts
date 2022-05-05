import mapboxgl from "mapbox-gl";
// import { mapBoxPk } from '../config';
import { PositionControl } from "./position";

interface MapOption {
  zoom?: number;
  rightBottomText?: string;
  mapBoxPk: string;
  container: any;
}

export class MapService {
  constructor(opt: MapOption) {
    mapboxgl.accessToken = opt.mapBoxPk;
    this.map = new mapboxgl.Map({
      container: opt.container,
      style: "mapbox://styles/scc-mapbox/ckte6enwr20p817nqqmofj5xl", // style URL
      zoom: opt?.zoom || 17, // starting zoom
    });
    const mapboxIcon = document.querySelector(".mapboxgl-ctrl-bottom-left");
    const rightText = document.querySelector(".mapboxgl-ctrl-attrib");
    mapboxIcon && (mapboxIcon.innerHTML = "");
    rightText && (rightText.innerHTML = opt?.rightBottomText || "");
    // this.map.addControl(
    //   new mapboxgl.GeolocateControl({
    //     positionOptions: {
    //       enableHighAccuracy: true,
    //     },
    //     trackUserLocation: true,
    //     showUserHeading: true,
    //     showAccuracyCircle: false,
    //   }),
    // );
  }

  public async initPosition(onPositionInit: (data: [number, number]) => void) {
    const positionControl = new PositionControl(this.map);
    const LngLat = await positionControl.init();
    onPositionInit(LngLat);
    return LngLat;
  }

  public map: mapboxgl.Map;
}
