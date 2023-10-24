type tokenTypes =
  | "START_OBJECT"
  | "END_OBJECT"
  | "START_ARRAY"
  | "END_ARRAY"
  | "KEY"
  | "VALUE";

export type JSONDataTypes =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "null";

export type tokenType = { type: tokenTypes; value?: string; level: number };

export class JsonStreamTokenizer {
  currentToken: string[];
  state: JSONDataTypes[];
  nestingLevel: number;
  onToken: Function;
  constructor(onToken: Function) {
    this.nestingLevel = 0;
    this.currentToken = [];
    this.state = [];
    this.onToken = onToken;
  }

  processChar(char: string) {
    switch (char) {
      case "{":
        this.emitToken();
        this.emitToken({ type: "START_OBJECT", level: this.nestingLevel++ });
        this.state.push("object");
        break;
      case "}":
        this.emitToken();
        this.emitToken({ type: "END_OBJECT", level: --this.nestingLevel });
        if (this.state.pop() !== "object") {
          throw new Error("Unexpected END_OBJECT");
        }
        break;
      case "[":
        this.emitToken();
        this.emitToken({ type: "START_ARRAY", level: this.nestingLevel++ });
        this.state.push("array");
        break;
      case "]":
        this.emitToken();
        this.emitToken({ type: "END_ARRAY", level: --this.nestingLevel });
        if (this.state.pop() !== "array") {
          throw new Error("Unexpected END_ARRAY");
        }
        break;
      case ",":
        this.emitToken();
        break;
      case ":":
        this.emitToken({
          type: "KEY",
          value: this.currentToken.join("").trim(),
          level: this.nestingLevel,
        });
        this.currentToken = [];
        break;
      case " ":
      case "\n":
        if (this.currentToken.length > 0) {
          this.currentToken.push(char);
        }
        break;

      default:
        this.currentToken.push(char);
        break;
    }
  }

  emitToken(token?: tokenType) {
    if (!token && this.currentToken.length > 0) {
      token = {
        type: "VALUE",
        value: this.currentToken.join("").trim(),
        level: this.nestingLevel,
      };
      this.currentToken = [];
    }
    if (token) {
      // console.log(token);
      setTimeout(() => {
        this.onToken(token);
      }, 1);
    }
  }

  processChunk(chunk: string) {
    for (const char of chunk.trim()) {
      this.processChar(char);
    }
  }

  end() {
    this.emitToken();
    if (this.state.length > 0) {
      throw new Error("Unexpected end of stream");
    }
    console.log("End of stream");
  }
}
