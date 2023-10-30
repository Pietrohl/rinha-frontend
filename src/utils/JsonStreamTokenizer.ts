enum State {
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
  | "NULL";

export interface Token {
  type: TokenDataType;
  depth: number;
  key?: string | number;
  value?: any;
  index?: number;
}

type TokenListener = (token: Token) => void;

export class JsonStreamTokenizer {
  private state: State[] = [State.START];
  private listeners: TokenListener[] = [];
  private buffer: string = "";
  private depth: number = 0;
  private arrayIndices: number[] = [];
  private keyStack: (string | number)[] = [];
  private count = 0;

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

  private emit(token: Token) {
    if (token.type === "END_OBJECT") return;
    token.index = this.count++;
    token.depth = this.depth;
    // this.tokens.push(token);
    for (const listener of this.listeners) {
      listener(token);
    }
  }

  end() {
    if (this.state.length > 0 || this.depth > 0) {
      throw new Error("Unexpected end of input");
    }
  }

  private getCurrentKey() {
    return this.keyStack.slice(-1)[0];
  }

  private getNextArrayIndex() {
    const key = this.arrayIndices.pop();
    if (key === undefined) {
      throw new Error("No array index found");
    }
    this.arrayIndices.push(key + 1);
    return key;
  }

  processChunk(chunk: string) {
    for (let char of chunk) {
      try {
        this.processChar(char);
      } catch (err) {
        throw err;
      }
    }
  }

  public processChar(char: string) {
    switch (this.state[this.state.length - 1]) {
      case State.IN_NUMBER:
        if (/[0-9.]/.test(char)) {
          this.buffer += char;
        } else {
          this.state.pop();
          const value = Number(this.buffer);
          this.buffer = "";
          if (this.keyStack.length > 0) {
            this.emit({
              type: "NUMBER",
              value,
              depth: this.depth,
              key: this.keyStack.pop(),
            });
          } else {
            this.emit({
              type: "NUMBER",
              value,
              depth: this.depth - 1,
              key: this.getCurrentKey(),
            });
          }
          this.processChar(char);
        }
        break;

      case State.START:
        if (char === "{") {
          this.state.pop();
          this.state.push(State.EXPECT_STRING_KEY_OR_END);
          this.emit({ type: "BEGIN_OBJECT", depth: this.depth });
          this.depth++;
        } else if (char === "[") {
          this.state.pop();
          this.state.push(State.IN_ARRAY);
          this.arrayIndices.push(0);
          this.keyStack.push(this.getNextArrayIndex());
          this.emit({ type: "BEGIN_ARRAY", depth: this.depth });
          this.depth++;
        } else if (char !== "") {
          throw new Error("Unexpected character at start");
        }
        break;

      case State.EXPECT_STRING_KEY_OR_END:
        if (char === "}") {
          this.state.pop();
          this.depth--;
          this.emit({ type: "END_OBJECT", depth: this.depth });
        } else if (char === '"') {
          this.state.push(State.IN_KEY);
          this.buffer = "";
        } else if (char === "]") {
          throw new Error("Unexpected character");
        }
        break;

      case State.IN_KEY:
        if (char === '"') {
          this.state.pop();
          this.state.push(State.EXPECT_COLON);
          const key = this.buffer;
          this.buffer = "";
          this.keyStack.push(key);
        } else {
          this.buffer += char;
        }
        break;

      case State.EXPECT_COLON:
        if (char === ":") {
          this.state.pop();
          this.state.push(State.EXPECT_VALUE);
        }
        break;

      case State.EXPECT_VALUE:
        if (char === "{") {
          this.state.pop();
          this.state.push(State.EXPECT_STRING_KEY_OR_END);
          this.emit({
            type: "BEGIN_OBJECT",
            depth: this.depth,
            key: this.keyStack.pop(),
          });
          this.depth++;
          if (this.state[this.state.length - 2] === State.IN_ARRAY) {
            this.keyStack.push(this.getNextArrayIndex());
          }
        } else if (char === "[") {
          this.state.pop();
          this.state.push(State.IN_ARRAY);
          this.emit({
            type: "BEGIN_ARRAY",
            depth: this.depth,
            key: this.keyStack.pop(),
          });
          if (this.state[this.state.length - 2] === State.IN_ARRAY) {
            this.keyStack.push(this.getNextArrayIndex());
          }
          this.arrayIndices.push(0);
          this.keyStack.push(this.getNextArrayIndex());
          this.depth++;
        } else if (char === '"') {
          this.state.pop();
          this.state.push(State.IN_STRING_VALUE);
          this.buffer = "";
        } else if (/[0-9-]/.test(char)) {
          this.state.pop();
          this.state.push(State.IN_NUMBER);
          this.buffer = char;
        } else if (char === "t") {
          this.state.pop();
          this.state.push(State.IN_TRUE);
          this.buffer = char;
        } else if (char === "f") {
          this.state.pop();
          this.state.push(State.IN_FALSE);
          this.buffer = char;
        } else if (char === "n") {
          this.state.pop();
          this.state.push(State.IN_NULL);
          this.buffer = char;
        }
        break;

      case State.IN_TRUE:
        this.buffer += char;
        if ("true".includes(this.buffer)) {
          if (this.buffer === "true") {
            this.state.pop();
            this.emit({
              type: "BOOLEAN",
              value: true,
              depth: this.depth,
              key: this.keyStack.pop(),
            });
          }
        } else {
          throw new Error("Unexpected character");
        }
        break;

      case State.IN_FALSE:
        this.buffer += char;
        if ("false".includes(this.buffer)) {
          if (this.buffer === "false") {
            this.state.pop();
            this.emit({
              type: "BOOLEAN",
              value: false,
              depth: this.depth,
              key: this.keyStack.pop(),
            });
          }
        } else {
          throw new Error("Unexpected character");
        }
        break;

      case State.IN_NULL:
        this.buffer += char;
        if ("null".includes(this.buffer)) {
          if (this.buffer === "null") {
            this.state.pop();
            this.emit({
              type: "NULL",
              value: null,
              depth: this.depth,
              key: this.keyStack.pop(),
            });
          }
        } else {
          throw new Error("Unexpected character");
        }
        break;

      case State.IN_STRING_VALUE:
        if (char === "\\") {
          this.state.push(State.IN_ESCAPE);
        } else if (char === '"') {
          this.state.pop();
          const value = this.buffer;
          this.buffer = "";
          if (this.keyStack.length > 0) {
            this.emit({
              type: "STRING",
              value,
              depth: this.depth,
              key: this.keyStack.pop(),
            });
          } else {
            this.emit({
              type: "STRING",
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
        this.state.pop();
        break;

      case State.IN_ARRAY:
        if (char === "]") {
          this.keyStack.pop();
          this.arrayIndices.pop();
          this.state.pop();
          this.emit({ type: "END_ARRAY", depth: --this.depth });
        } else if (char === "{") {
          this.state.push(State.EXPECT_STRING_KEY_OR_END);
          this.emit({
            type: "BEGIN_OBJECT",
            depth: this.depth,
            key: this.keyStack.pop(),
          });
          this.depth++;
        } else if (char === "[") {
          this.state.push(State.IN_ARRAY);
          this.emit({
            type: "BEGIN_ARRAY",
            depth: this.depth,
            key: this.keyStack.pop(),
          });
          this.arrayIndices.push(0);
          this.keyStack.push(this.getNextArrayIndex());
          this.depth++;
        } else if (char === '"') {
          this.state.push(State.IN_STRING_VALUE);
          this.buffer = "";
        } else if (/[0-9-]/.test(char)) {
          this.state.push(State.IN_NUMBER);
          this.buffer = char;
        } else if (char === "t") {
          this.state.push(State.IN_STRING_VALUE);
          this.buffer = "true";
        } else if (char === "f") {
          this.state.push(State.IN_STRING_VALUE);
          this.buffer = "false";
        } else if (char === "n") {
          this.state.push(State.IN_STRING_VALUE);
          this.buffer = "null";
        } else if (char === ",") {
          this.keyStack.push(this.getNextArrayIndex());
        } else if (char === "}") {
          throw new Error("Unexpected character in array");
        }
        break;
    }
  }
}
