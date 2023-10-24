import { Match, Show, Switch } from "solid-js";
import "./App.css";
import VirtualizedPanel from "./components/VirtualizedPanel";
import { parseObject, object } from "./utils/parseObject";

function App() {
  // const [fileContent, setFileContent] = createSignal<File | undefined>();

  return (
    <>
      <Switch
        fallback={
          <div>
            <input
              onInput={(e) => parseObject(e.target.files?.[0])}
              type="file"
              id="input"
              accept=".json"
            />
          </div>
        }
      >
        <Match when={object.error}>
          <div>Error: {object.error} </div>
        </Match>
        <Match when={object.items.length > 0}>
          <VirtualizedPanel object={object!} />
        </Match>
      </Switch>
    </>
  );
}

export default App;
