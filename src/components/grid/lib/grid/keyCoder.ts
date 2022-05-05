import { DGrid } from "./DGrid";
// 对grid进行encode decode的工具
export class KeyCoder {
  public encode(hexIndex: DGrid): string {
    return DGrid.encode(hexIndex.layer, hexIndex.face, hexIndex.i, hexIndex.j);
  }
  public encodes(hexIndexes: DGrid[]) {
    return hexIndexes.map((ele) => this.encode(ele));
  }
  public decode(hexKey: string): DGrid | null {
    // `BC${layer}M${face}x${i}y${j}F`
    const lpos = hexKey.indexOf("C");
    const fpos = hexKey.indexOf("M");
    const ipos = hexKey.indexOf("x");
    const jpos = hexKey.indexOf("y");
    if (lpos !== -1 && fpos !== -1 && ipos !== -1 && jpos !== -1) {
      const size = hexKey.length;
      const lind = parseInt(hexKey.substring(lpos + 1, fpos));
      const find = parseInt(hexKey.substring(fpos + 1, ipos));
      const iind = parseInt(hexKey.substring(ipos + 1, jpos));
      const jind = parseInt(hexKey.substring(jpos + 1, size));
      return new DGrid(lind, find, iind, jind);
    }
    return null;
  }

  public decodes(hexKeys: string[]): (DGrid | null)[] {
    return hexKeys.map((ele) => this.decode(ele));
  }
}
