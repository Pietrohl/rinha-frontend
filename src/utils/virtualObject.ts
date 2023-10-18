export class VirtualObject {
  public items: VirtualObjectProperty[] = [];
  public height = 1;
  public lineIndex: number;
  public type: 'array' | 'object';

  constructor(items: [string, unknown][], lineIndex = 0, type: 'array' | 'object' = 'object') {
    this.lineIndex = lineIndex;
    this.type = type;
    items.forEach((item) => {
      const newItem = new VirtualObjectProperty(item, lineIndex + this.height);
      this.items.push(newItem);
      this.height += newItem.height;
    });
    this.height = this.items.reduce((acc, item) => acc + item.height, 0);
    
  }
}

export class VirtualObjectProperty {
  public key: string;
  public value: any;
  public height = 1;
  public lineIndex: number;
  public show = () => true;

  constructor(item: [string, unknown], lineIndex = 0) {
    this.key = item[0];
    this.lineIndex = lineIndex;
    if (typeof item[1] === "object" && item[1] !== null) {
      this.value = new VirtualObject(Object.entries(item[1]), lineIndex, Array.isArray(item[1]) ? 'array' : 'object');
      this.height = this.value.height + 2;
    } else {
      this.value = item[1];
    }
  }
}
