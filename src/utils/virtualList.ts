export class VirtualList {
  public height: number;
  public items: VirtualListItem[];

  constructor(items: [string, unknown][]) {
    this.items = items.map((item) => new VirtualListItem(item));
    this.height = this.items.reduce((acc, item) => acc + item.heigth, 0);
  }

  get computedItems(): VirtualListItem[] {
   return this.items.slice(0, 1);
  }
}

export class VirtualListItem {
  public key: string;
  public heigth: number;
  public value: any;
  constructor(item: [string, unknown]) {
    this.key = item[0];
    if (typeof item[1] === "object" && item[1] !== null) {
      this.value = new VirtualList(Object.entries(item[1]));
      this.heigth = this.value.heigth + 1;
      return;
    }
    this.value = item[1];
    this.heigth = 1;
  }
}
