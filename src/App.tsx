import { Match, Show, Switch, createEffect, createSignal, on } from "solid-js";
import "./App.css";
import VirtualizedPanel from "./components/VirtualizedPanel";
import { createMutable } from "solid-js/store";
import { JsonStreamTokenizer, Token } from "./utils/JsonStreamTokenizer";
import { isServer } from "solid-js/web";

let buffer = new ArrayBuffer(262144);
const parser = new JsonStreamTokenizer();

function App() {
  const utf8Decoder = new TextDecoder("utf-8");

  const list = createMutable({ error: "", done: true, items: [] as Token[] });
  const [fileContent, setFileContent] = createSignal<File | undefined>();

  parser.subscribe((token) => {
    if (token && !list.error) {
      if (token.some(({ type }) => type === "error")) {
        list.items = [];
        list.error = "Invalid Json!";
        return;
      }
      if (token[token.length - 1].type === "end") {
        list.done = true;
      }
      
      list.items.push(...token);
    }
  });

  createEffect(
    on(
      fileContent,
      async () => {
        if (isServer) return;

        performance.mark("FileReadStart");
        const file = fileContent();
        if (!file) {
          return;
        }
        const stream = file.stream().getReader({ mode: "byob" });
        list.items = [];
        list.error = "";
        list.done = false;

        while (true) {
          let bufferView = new Uint8Array(buffer);
          performance.measure("FileReadTick", { start: "FileReadStart" });
          const { done, value } = await stream.read(bufferView);

          if (done) {
            parser.end();
            performance.mark("FileReadEnd");
            console.log("Ticks", performance.getEntriesByName("FileReadTick"));
            console.log(
              "time: ",
              performance.measure("FileReadEnd", "FileReadStart")
            );
            list.done = true;
            break;
          }

          if (value) {
            buffer = value.buffer.slice(
              value.byteOffset,
              value.byteOffset + value.byteLength
            );
            const chunck = utf8Decoder.decode(value, { stream: true });
            parser.processChunk(chunck);
          }
        }
      },
      { defer: true }
    )
  );

  let inputRef: HTMLInputElement | undefined;
  return (
    <>
    {/* <div style={{position: "absolute", top: '0px'}}>
      Done: {list.done.toString()}
      List: {list.items.length}
    </div> */}
      <Switch fallback={<div>Loading...</div>}>
        <Match when={!(list.items.length > 0) || list.error}>
          <div class="container">
            <h1>JSON Tree Viewer</h1>
            <h2 class="h3">
              Simple JSON Viewer that runs completely on-client. No data
              exchange
            </h2>
            <div>
              <button
                type="button"
                onClick={() => {
                  inputRef?.click();
                }}
              >
                Load JSON
              </button>
              <input
                style={{ display: "none" }}
                ref={inputRef!}
                onInput={(e) =>
                  setFileContent(() => e.currentTarget.files?.[0])
                }
                type="file"
                id="input"
                accept=".json"
              />
            </div>
            <Show when={list.error}>
              <p class="error">Invalid file. Please load a valid JSON file. </p>
            </Show>
          </div>
        </Match>
        <Match when={list.items.length > 0}>
          <h1 class="h2">{fileContent()?.name}</h1>
          <VirtualizedPanel list={list.items} />
        </Match>
      </Switch>
    </>
  );
}

export default App;
