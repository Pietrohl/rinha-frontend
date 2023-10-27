enum State {
  START,
  EXPECT_STRING_KEY_OR_END,
  EXPECT_COLON,
  EXPECT_VALUE,
  IN_STRING,
  IN_ESCAPE,
  IN_ARRAY,
  IN_OBJECT,
}

const TokenDataType =
  "BEGIN_OBJECT" || "END_OBJECT" || "BEGIN_ARRAY" || "END_ARRAY" || "string";

interface Token {
  type: string;
  key?: string | number;
  value?: any;
  depth: number;
}

type TokenListener = (token: Token) => void;

export class JsonStreamTokenizer {
  private state: State = State.START;
  private listeners: TokenListener[] = [];
  private buffer: string = "";
  private depth: number = 0;
  private arrayIndices: { [key: string]: number } = {};
  private keyStack: (string | number)[] = [];
  private tokens: Token[] = [];

  subscribe(listener: TokenListener) {
    this.listeners.push(listener);
  }

  private emit(token: Token) {
    token.depth = this.depth;
    if (this.keyStack.length > 0) {
      token.key = this.getCurrentKey();
    }
    for (const listener of this.listeners) {
      listener(token);
    }
  }

  end() {
    if (this.state !== State.START) {
      throw new Error("Unexpected end of input");
    }
  }

  private getCurrentKey() {
    return this.keyStack.slice(-1)[0];
  }

  private getNextArrayIndex() {
    const key = this.keyStack.join(".");
    return (this.arrayIndices[key] = (this.arrayIndices[key] || 0) + 1);
  }

  processChunk(chunk: string) {
    for (let char of chunk) {
      this.processChar(char);
    }
  }

  public processChar(char: string) {
    switch (this.state) {
      case State.START:
        if (char === "{") {
          this.state = State.EXPECT_STRING_KEY_OR_END;
          this.emit({ type: "BEGIN_OBJECT", depth: this.depth });
          this.depth++;
        } else if (char === "[") {
          this.state = State.IN_ARRAY;
          this.emit({ type: "BEGIN_ARRAY", depth: this.depth });
          this.depth++;
        } else if (char.trim() !== "") {
          throw new Error("Unexpected character at start");
        }
        break;
      case State.EXPECT_STRING_KEY_OR_END:
        if (char === "}") {
          this.state = State.START;
          this.emit({ type: "END_OBJECT", depth: this.depth });
          this.depth--;
          this.keyStack.pop();
        } else if (char === '"') {
          this.state = State.IN_STRING;
          this.buffer = "";
        }
        break;
      case State.EXPECT_COLON:
        if (char === ":") {
          this.state = State.EXPECT_VALUE;
        }
        break;
      case State.EXPECT_VALUE:
        if (char === "{") {
          this.state = State.EXPECT_STRING_KEY_OR_END;
          this.emit({ type: "BEGIN_OBJECT", depth: this.depth });
          this.depth++;
        } else if (char === "[") {
          this.state = State.IN_ARRAY;
          this.emit({ type: "BEGIN_ARRAY", depth: this.depth });
          this.depth++;
        } else if (char === '"') {
          this.state = State.IN_STRING;
          this.buffer = "";
        } else if (/[0-9-]/.test(char)) {
          this.state = State.IN_STRING;
          this.buffer = char;
        } else if (char === "t") {
          this.state = State.IN_STRING;
          this.buffer = "true";
        } else if (char === "f") {
          this.state = State.IN_STRING;
          this.buffer = "false";
        } else if (char === "n") {
          this.state = State.IN_STRING;
          this.buffer = "null";
        }
        break;
      case State.IN_STRING:
        if (char === "\\") {
          this.state = State.IN_ESCAPE;
        } else if (char === '"') {
          this.state =
            this.keyStack.length > 0
              ? State.EXPECT_COLON
              : State.EXPECT_STRING_KEY_OR_END;
          const value = this.buffer;
          this.buffer = "";
          if (this.keyStack.length > 0) {
            this.emit({ type: "string", value, depth: this.depth });
          } else {
            this.emit({
              type: "string",
              value,
              depth: this.depth - 1,
              key: this.getCurrentKey(),
            });
          }
        } else {
          this.buffer += char;
        }
        break;
      case State.IN_ESCAPE:
        this.buffer += char;
        this.state = State.IN_STRING;
        break;
      case State.IN_ARRAY:
        if (char === "]") {
          this.state = this.depth === 1 ? State.START : State.EXPECT_VALUE;
          this.emit({ type: "END_ARRAY", depth: this.depth });
          this.depth--;
          this.keyStack.pop();
        } else if (char === "{") {
          this.state = State.EXPECT_STRING_KEY_OR_END;
          this.emit({ type: "BEGIN_OBJECT", depth: this.depth });
          this.depth++;
        } else if (char === "[") {
          this.state = State.IN_ARRAY;
          this.emit({ type: "BEGIN_ARRAY", depth: this.depth });
          this.depth++;
        } else if (char === '"') {
          this.state = State.IN_STRING;
          this.buffer = "";
        } else if (/[0-9-]/.test(char)) {
          this.state = State.IN_STRING;
          this.buffer = char;
        } else if (char === "t") {
          this.state = State.IN_STRING;
          this.buffer = "true";
        } else if (char === "f") {
          this.state = State.IN_STRING;
          this.buffer = "false";
        } else if (char === "n") {
          this.state = State.IN_STRING;
          this.buffer = "null";
        } else if (char.trim() !== "") {
          throw new Error("Unexpected character in array");
        }
        break;
    }
  }
}
