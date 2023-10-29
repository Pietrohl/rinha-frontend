import { Match, Switch, createEffect, createSignal, from, on } from "solid-js";
import "./App.css";
import VirtualizedPanel from "./components/VirtualizedPanel";
import { createMutable } from "solid-js/store";
import { JsonStreamTokenizer, Token } from "./utils/JsonStreamTokenizer";
import { isServer } from "solid-js/web";

let buffer = new ArrayBuffer(16384);
const parser = new JsonStreamTokenizer();

function App() {
  const utf8Decoder = new TextDecoder("utf-8");

  const list = createMutable({ error: "", done: true, items: [] as Token[] });
  const [fileContent, setFileContent] = createSignal<File | undefined>();

  const observable = from<Token>((set) => {
    const listener = parser.subscribe(set);
    return () => {
      parser.unsubscribe(listener);
    };
  });

  createEffect(
    on(observable, () => {
      const token = observable();
      if (token) list.items.push(token);
    })
  );

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

        try {
          while (true) {
            let bufferView = new Uint8Array(buffer);
            performance.measure("FileReadTick", { start: "FileReadStart" });
            const { done, value } = await stream.read(bufferView);

            if (done) {
              parser.end();
              performance.mark("FileReadEnd");
              console.log(
                "Ticks",
                performance.getEntriesByName("FileReadTick")
              );
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
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
        } catch (e) {
          list.error = "Invalid Json!";
        }
      },
      { defer: true }
    )
  );

  return (
    <>
      <Switch
        fallback={
          <div>
            <input
              onInput={(e) => setFileContent(() => e.currentTarget.files?.[0])}
              type="file"
              id="input"
              accept=".json"
            />
          </div>
        }
      >
        <Match when={list.error}>
          <div>Error: {list.error} </div>
        </Match>
        <Match when={list.items.length > 0}>
          <VirtualizedPanel list={list.items} />
        </Match>
      </Switch>
    </>
  );
}

export default App;
