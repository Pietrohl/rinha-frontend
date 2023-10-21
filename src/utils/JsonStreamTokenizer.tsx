type tokenTypes =
  | "START_OBJECT"
  | "END_OBJECT"
  | "START_ARRAY"
  | "END_ARRAY"
  | "KEY"
  | "VALUE";
// Json data types constants
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

  // Process a single character
  processChar(char: string) {
    switch (char) {
      case "{":
        this.emitToken(); // Emit any buffered token
        this.emitToken({ type: "START_OBJECT", level: this.nestingLevel++ });
        this.state.push("object");
        break;
      case "}":
        this.emitToken(); // Emit any buffered token
        this.emitToken({ type: "END_OBJECT", level: this.nestingLevel-- });
        if (this.state.pop() !== "object") {
          throw new Error("Unexpected END_OBJECT");
        }
        break;
      case "[":
        this.emitToken(); // Emit any buffered token
        this.emitToken({ type: "START_ARRAY", level: this.nestingLevel++ });
        this.state.push("array");
        break;
      case "]":
        this.emitToken(); // Emit any buffered token
        this.emitToken({ type: "END_ARRAY", level: this.nestingLevel-- });
        if (this.state.pop() !== "array") {
          throw new Error("Unexpected END_ARRAY");
        }
        break;
      case ",":
        this.emitToken(); // Emit any buffered token
        break;
      case ":":
        // Don't emit KEY token until we see the colon
        this.emitToken({
          type: "KEY",
          value: this.currentToken.join("").trim(),
          level: this.nestingLevel,
        });
        this.currentToken = []; // Clear the current token
        break;
      case " ":
      case "\n":
        // Ignore whitespace case the is no token to buffer
        if (this.currentToken.length > 0) {
          this.currentToken.push(char); // Buffer the character
        }
        break;

      default:
        this.currentToken.push(char); // Buffer the character
        break;
    }
  }

  // Emit the buffered token, if any
  emitToken(token?: tokenType) {
    debugger;
    if (!token && this.currentToken.length > 0) {
      // If no explicit token is passed, emit the current buffered token as a VALUE
      token = {
        type: "VALUE",
        value: this.currentToken.join("").trim(),
        level: this.nestingLevel,
      };
      this.currentToken = []; // Clear the current token
    }
    if (token) {
      console.log(token);
      this.onToken(token);
    }
  }

  // Process a chunk of data
  processChunk(chunk: string) {
    for (const char of chunk.trim()) {
      this.processChar(char);
    }
  }

  // Process the end of the data
  end() {
    this.emitToken(); // Emit any buffered token
    if (this.state.length > 0) {
      throw new Error("Unexpected end of stream");
    }
    console.log("End of stream");
  }
}
