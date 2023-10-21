import type { JSONDataTypes, tokenType } from "./JsonStreamTokenizer";

export type VirtualObjectToken = {
  type: JSONDataTypes;
  key: string;
  nestedLevel: number;
  value?: string;
};

export class VirtualList {
  protected items;
  private state: Array<"object" | "array"> = [];
  private lastToken?: tokenType;


  constructor() {
    this.items = new Array<VirtualObjectToken>()
  }



  public push(item: tokenType) {
    if (item.type === "KEY") {
      this.lastToken = item;
      return;
    }

    if (this.lastToken?.value && this.lastToken?.type === "KEY") {
      if (item.type === "START_OBJECT") {
        this.items.push({
          nestedLevel: item.level,
          type: "object",
          key: this.lastToken.value,
        });
        this.state.push("object");
        this.lastToken = undefined;
        return;
      }

      if (item.type === "START_ARRAY") {
        this.items.push({
          nestedLevel: item.level,
          type: "array",
          key: this.lastToken.value,
        });
        this.state.push("array");
        this.lastToken = undefined;
        this.lastToken = { type: "KEY", value: "0", level: item.level + 1 };
        return;
      }

      if (item.type === "VALUE") {
        this.items.push({
          key: this.lastToken.value,
          nestedLevel: item.level,
          type: "string",
          value: item.value,
        });

        if (this.state.slice(-1)[0] === "array") {
          this.lastToken = {
            ...this.lastToken,
            value: String(Number(this.lastToken.value) + 1),
          };
          return;
        }

        this.lastToken = undefined;
        return;
      }
    }

    if (item.type === "START_OBJECT") {
      this.items.push({
        nestedLevel: item.level,
        type: "object",
        key: "0",
      });
      this.state.push("object");
      return;
    }

    if (item.type === "START_ARRAY") {
      this.items.push({
        nestedLevel: item.level,
        type: "array",
        key: "0",
      });
      this.state.push("array");
      this.lastToken = undefined;
      this.lastToken = { type: "KEY", value: "0", level: item.level + 1 };
      return;
    }
  }
}
