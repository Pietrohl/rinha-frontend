import { State } from "./JsonStreamTokenizer";

let state: State[] = [State.START];
let buffer: string = "";
let depth: number = 0;
let arrayIndices: number[] = [];
let keyStack: (string | number)[] = [];

function getCurrentKey() {
  return keyStack.slice(-1)[0];
}

function getNextArrayIndex() {
  const key = arrayIndices.pop();
  if (key === undefined) {
    throw new Error("No array index found");
  }
  arrayIndices.push(key + 1);
  return key;
}

function processChunk(chunk: string) {
  for (let char of chunk) {
    processChar(char);
  }
}

function processChar(char: string) {
  switch (state[state.length - 1]) {
    case State.IN_NUMBER:
      if (/[0-9.]/.test(char)) {
        buffer += char;
      } else {
        state.pop();
        const value = Number(buffer);
        buffer = "";
        if (keyStack.length > 0) {
          postMessage({
            type: "NUMBER",
            value,
            depth: depth,
            key: keyStack.pop(),
          });
        } else {
          postMessage({
            type: "NUMBER",
            value,
            depth: depth - 1,
            key: getCurrentKey(),
          });
        }
        processChar(char);
      }
      break;

    case State.START:
      if (char === "{") {
        state.pop();
        state.push(State.EXPECT_STRING_KEY_OR_END);
        postMessage({ type: "BEGIN_OBJECT", depth: depth });
        depth++;
      } else if (char === "[") {
        state.pop();
        state.push(State.IN_ARRAY);
        arrayIndices.push(0);
        keyStack.push(getNextArrayIndex());
        postMessage({ type: "BEGIN_ARRAY", depth: depth });
        depth++;
      } else if (char !== "" && char !== "]" && char !== "}") {
        throw new Error("Unexpected character at start");
      }
      break;

    case State.EXPECT_STRING_KEY_OR_END:
      if (char === "}") {
        state.pop();
        depth--;
        postMessage({ type: "END_OBJECT", depth: depth });
      } else if (char === '"') {
        state.push(State.IN_KEY);
        buffer = "";
      } else if (char === "]") {
        throw new Error("Unexpected character");
      }
      break;

    case State.IN_KEY:
      if (char === '"') {
        state.pop();
        state.push(State.EXPECT_COLON);
        const key = buffer;
        buffer = "";
        keyStack.push(key);
      } else {
        buffer += char;
      }
      break;

    case State.EXPECT_COLON:
      if (char === ":") {
        state.pop();
        state.push(State.EXPECT_VALUE);
      }
      break;

    case State.EXPECT_VALUE:
      if (char === "{") {
        state.pop();
        state.push(State.EXPECT_STRING_KEY_OR_END);
        postMessage({
          type: "BEGIN_OBJECT",
          depth: depth,
          key: keyStack.pop(),
        });
        depth++;
        if (state[state.length - 2] === State.IN_ARRAY) {
          keyStack.push(getNextArrayIndex());
        }
      } else if (char === "[") {
        state.pop();
        state.push(State.IN_ARRAY);
        postMessage({
          type: "BEGIN_ARRAY",
          depth: depth,
          key: keyStack.pop(),
        });
        if (state[state.length - 2] === State.IN_ARRAY) {
          keyStack.push(getNextArrayIndex());
        }
        arrayIndices.push(0);
        keyStack.push(getNextArrayIndex());
        depth++;
      } else if (char === '"') {
        state.pop();
        state.push(State.IN_STRING_VALUE);
        buffer = "";
      } else if (/[0-9-]/.test(char)) {
        state.pop();
        state.push(State.IN_NUMBER);
        buffer = char;
      } else if (char === "t") {
        state.pop();
        state.push(State.IN_TRUE);
        buffer = char;
      } else if (char === "f") {
        state.pop();
        state.push(State.IN_FALSE);
        buffer = char;
      } else if (char === "n") {
        state.pop();
        state.push(State.IN_NULL);
        buffer = char;
      }
      break;

    case State.IN_TRUE:
      buffer += char;
      if ("true".includes(buffer)) {
        if (buffer === "true") {
          state.pop();
          postMessage({
            type: "BOOLEAN",
            value: true,
            depth: depth,
            key: keyStack.pop(),
          });
        }
      } else {
        throw new Error("Unexpected character");
      }
      break;

    case State.IN_FALSE:
      buffer += char;
      if ("false".includes(buffer)) {
        if (buffer === "false") {
          state.pop();
          postMessage({
            type: "BOOLEAN",
            value: false,
            depth: depth,
            key: keyStack.pop(),
          });
        }
      } else {
        throw new Error("Unexpected character");
      }
      break;

    case State.IN_NULL:
      buffer += char;
      if ("null".includes(buffer)) {
        if (buffer === "null") {
          state.pop();
          postMessage({
            type: "NULL",
            value: null,
            depth: depth,
            key: keyStack.pop(),
          });
        }
      } else {
        throw new Error("Unexpected character");
      }
      break;

    case State.IN_STRING_VALUE:
      if (char === "\\") {
        state.push(State.IN_ESCAPE);
      } else if (char === '"') {
        state.pop();
        const value = buffer;
        buffer = "";
        if (keyStack.length > 0) {
          postMessage({
            type: "STRING",
            value,
            depth: depth,
            key: keyStack.pop(),
          });
        } else {
          postMessage({
            type: "STRING",
            value,
            depth: depth - 1,
            key: getCurrentKey(),
          });
        }
      } else {
        buffer += char;
      }
      break;

    case State.IN_ESCAPE:
      buffer += char;
      state.pop();
      break;

    case State.IN_ARRAY:
      if (char === "]") {
        keyStack.pop();
        arrayIndices.pop();
        state.pop();
        postMessage({ type: "END_ARRAY", depth: --depth });
      } else if (char === "{") {
        state.push(State.EXPECT_STRING_KEY_OR_END);
        postMessage({
          type: "BEGIN_OBJECT",
          depth: depth,
          key: keyStack.pop(),
        });
        depth++;
      } else if (char === "[") {
        state.push(State.IN_ARRAY);
        postMessage({
          type: "BEGIN_ARRAY",
          depth: depth,
          key: keyStack.pop(),
        });
        arrayIndices.push(0);
        keyStack.push(getNextArrayIndex());
        depth++;
      } else if (char === '"') {
        state.push(State.IN_STRING_VALUE);
        buffer = "";
      } else if (/[0-9-]/.test(char)) {
        state.push(State.IN_NUMBER);
        buffer = char;
      } else if (char === "t") {
        state.push(State.IN_STRING_VALUE);
        buffer = "true";
      } else if (char === "f") {
        state.push(State.IN_STRING_VALUE);
        buffer = "false";
      } else if (char === "n") {
        state.push(State.IN_STRING_VALUE);
        buffer = "null";
      } else if (char === ",") {
        keyStack.push(getNextArrayIndex());
      } else if (char === "}") {
        throw new Error("Unexpected character in array");
      }
      break;
  }
}

onmessage = ({
  data,
}: MessageEvent<{ data: string; type: "chunk" | "end" }>) => {
  if (data.type === "end") {
    if (state.length > 0 || depth > 0) {
      throw new Error("Unexpected end of file");
    }
    postMessage({ type: "end" });
    return;
  }

  if (data.type === "chunk") {
    processChunk(data.data);
  }
};

self.onerror = function (message) {
  postMessage({ type: "error", value: message });
};
