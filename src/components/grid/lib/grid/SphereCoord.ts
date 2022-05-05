// 地球极坐标坐标点，基础类
export class SphereCoord {
  constructor(radial: number, polar: number, azim: number) {
    this._radial = radial;
    this._polar = polar;
    this._azim = azim;
  }
  private _radial;
  private _polar;
  private _azim;
  get radial(): number {
    return this._radial;
  }
  set radial(radial: number) {
    this._radial = radial;
  }
  get polar(): number {
    return this._polar;
  }
  set polar(polar: number) {
    this._polar = polar;
  }
  get azim(): number {
    return this._azim;
  }
  set azim(azim: number) {
    this._azim = azim;
  }
  public toString(): string {
    return SphereCoord.encode(this._radial, this._polar, this._azim);
  }
  public static encode(radial: number, polar: number, azim: number) {
    return `SphereCoord_${radial}_radial${polar}_polar${azim}_azim`;
  }
}
