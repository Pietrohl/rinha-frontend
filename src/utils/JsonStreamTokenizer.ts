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
  | "error";

export interface Token {
  type: TokenDataType;
  depth: number;
  key?: string | number;
  value?: any;
  index?: number;
}

type TokenListener = (token?: Token, error?: Error) => void;

export class JsonStreamTokenizer {
  private listeners: TokenListener[] = [];
  private worker: Worker;
  private count = 0;

  constructor() {
    if (window.Worker) {
      this.worker = new mdWorker();
      this.worker.onerror = (e) => {
        this.emit({ type: "error", value: e.message, depth: 0 });
      };
      this.worker.addEventListener("message", (e) => {
        const { type } = e.data;
        switch (type) {
          case "end":
            this.worker.terminate();
            break;
          default:
            this.emit(e.data);
        }
      });
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

  private emit(token?: Token, error?: Error) {
    if (error) {
      for (const listener of this.listeners) {
        listener(undefined, error);
      }
      return;
    }
    if (token) {
      if (token.type === "END_OBJECT") return;
      token.index = this.count++;
      for (const listener of this.listeners) {
        listener(token);
      }
    }
  }

  end() {
    this.worker.postMessage({ type: "end" });
  }

  processChunk(chunk: string) {
    if (window.Worker) {
      if (!this.worker) {
        this.worker = new mdWorker();
        this.worker.onerror = (e) => {
          this.emit({ type: "error", value: e.message, depth: 0 });
        };
        this.worker.addEventListener("message", (e) => {
          const { type } = e.data;
          switch (type) {
            case "end":
              this.worker.terminate();
              break;
            default:
              this.emit(e.data);
          }
        });
      }
    }

    this.worker.postMessage({ type: "chunk", data: chunk });
  }
}
