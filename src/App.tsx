import { Show, createResource, createSignal } from "solid-js";
import "./App.css";
import VirtualizedPanel from "./components/VirtualizedPanel";
import { parseObject } from "./utils/parseObject";

function App() {
  const [fileContent, setFileContent] = createSignal<File | undefined>();
  const [objectData] = createResource(fileContent, parseObject);

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
        <VirtualizedPanel object={objectData()!} />
      </Show>
    </>
  );
}

export default App;
