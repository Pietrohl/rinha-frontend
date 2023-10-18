import { Show, createEffect, createResource, createSignal } from "solid-js";
import "./App.css";
import VirtualizedPanel from "./components/VirtualizedPanel";
import { VirtualObject } from "./utils/virtualObject";
import { isServer } from "solid-js/web";

const parseObject = async (file: File | undefined) => {
  const utf8Decoder = new TextDecoder("utf-8");
  let result;
  if (isServer) return null;

  if (!file) {
    return null;
  }

  let reminder = "";
  const stream = file.stream().getReader();

  await stream
    .read()
    .then(function processStream({ done, value }): any {
      if (done) return;

      if (value) {
        const chunck = utf8Decoder.decode(value, { stream: true });

        console.log("value", chunck);
        reminder += chunck;
      }

      return stream.read().then(processStream);
    })
    .then(() => {
      // console.log("reminder", reminder);
      result = new VirtualObject(Object.entries(JSON.parse(reminder)));
    });
  return result;
};

function App() {
  const [fileContent, setFileContent] = createSignal<File | undefined>();
  const [objectData] = createResource(fileContent, parseObject);

  // instead of using the file reader, rewrite the virtual object to use the FILE api

  return (
    <>
      <div>
        <input
          onInput={(e) => setFileContent(() => e.target.files?.[0])}
          type="file"
          id="input"
          accept=".json"
        />
      </div>
      <Show when={objectData()}>
        {/* <VirtualizedPanel object={objectData()!} /> */}
      </Show>
    </>
  );
}

export default App;
