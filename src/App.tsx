import { Match, Switch } from "solid-js";
import "./App.css";
import VirtualizedPanel from "./components/VirtualizedPanel";
import { parseObject } from "./utils/parseObject";
import { createMutable } from "solid-js/store";
import { VirtualList } from "./utils/virtualList";

function App() {
const object = createMutable(new VirtualList());
// const [fileContent, setFileContent] = createSignal<File | undefined>();








  return (
    <>
      <Switch
        fallback={
          <div>
            <input
              onInput={(e) => parseObject(e.target.files?.[0], object)}
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
