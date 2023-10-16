export class VirtualObject {
  public lineIndex: number;
  public items: VirtualObjectProperty[];
  public height = 1;

  constructor(items: [string, unknown][], lineIndex = 0) {
    this.items = items.map(
      (item, i) => new VirtualObjectProperty(item, lineIndex + i)
    );
    this.lineIndex = lineIndex;
    this.height = this.items.reduce((acc, item) => acc + item.height, 0);
  }
}

export class VirtualObjectProperty {
  public key: string;
  public value: any;
  public lineIndex: number;
  public height = 1;
  public show = () => true;

  constructor(item: [string, unknown], lineIndex: number) {
    this.key = item[0];
    this.lineIndex = lineIndex;
    if (typeof item[1] === "object" && item[1] !== null) {
      this.value = new VirtualObject(Object.entries(item[1]), lineIndex);
      this.height = this.value.height + 1;
    } else {
      this.value = item[1];
    }
  }
}
