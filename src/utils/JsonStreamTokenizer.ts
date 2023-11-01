import { isServer } from "solid-js/web";
import mdWorker from "./md-jsonStreamTokenizer?worker";

export enum State {
  START,
  EXPECT_STRING_KEY_OR_END,
  EXPECT_COLON,
  EXPECT_VALUE,
  IN_STRING_VALUE,
  IN_NUMBER,
  IN_ESCAPE,
  IN_ARRAY,
  IN_OBJECT,
  IN_KEY,
  IN_FALSE,
  IN_TRUE,
  IN_NULL,
}

type TokenDataType =
  | "BEGIN_OBJECT"
  | "END_OBJECT"
  | "BEGIN_ARRAY"
  | "END_ARRAY"
  | "STRING"
  | "NUMBER"
  | "BOOLEAN"
  | "NULL"
  | "end"
  | "error";

export interface Token {
  type: TokenDataType;
  depth: number;
  key?: string | number;
  value?: any;
  index?: number;
}

type TokenListener = (token: Token[]) => void;

export class JsonStreamTokenizer {
  private listeners: TokenListener[] = [];
  private worker?: Worker;
  private count = 0;

  private onMessage = (e: MessageEvent<Token[]>) => {
    const { type } = e.data[0];
    switch (type) {
      case "end":
        this.worker?.terminate();
        this.emit([{ type: "end", depth: 0 }]);
        break;
      default:
        this.emit(e.data);
    }
  };

  private onError = (e: ErrorEvent) => {
    this.emit([{ type: "error", value: e.message, depth: 0 }]);
  };

  constructor() {
    if (isServer) return;
    if (window.Worker) {
      this.worker = new mdWorker();
      this.worker.onerror = this.onError;
      this.worker.onmessage = this.onMessage;
    } else {
      throw new Error("Web Worker not supported");
    }
  }

  subscribe(listener: TokenListener) {
    this.listeners.push(listener);
    return listener;
  }

  unsubscribe(listener: TokenListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private emit(tokens: Token[]) {
    let j = 0;

    tokens.forEach((token, i) => {
      if (!(token.type === "END_OBJECT")) {
        if (i !== j) tokens[j] = token;
        token.index = this.count++;
        j++;
      }
    });
    tokens.length = j;
    for (const listener of this.listeners) {
      listener(tokens);
    }
  }

  end() {
    this.worker?.postMessage({ type: "end" });
  }

  processChunk(chunk: string) {
    if (isServer) return;

    if (window.Worker) {
      if (!this.worker) {
        this.worker = new mdWorker();
        this.worker.onerror = this.onError;
        this.worker.onmessage = this.onMessage;
      }
    }

    this.worker?.postMessage({ type: "chunk", data: chunk });
  }
}
