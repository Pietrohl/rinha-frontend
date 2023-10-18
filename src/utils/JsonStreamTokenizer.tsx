export class JsonStreamTokenizer {
  currentToken: string[];
  state: any[];
  nestingLevel: number;

  constructor() {
    this.nestingLevel = 0;
    this.currentToken = [];
    this.state = []; // Stack to track the current state
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
  emitToken(token?: { type: string; value?: string; level?: number; }) {
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
      // console.log(token);
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
