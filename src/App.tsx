import { createSignal } from "solid-js";
import "./App.css";
import VirtualizedPanel from "./components/VirtualizedPanel";
import { VirtualObject } from "./utils/virtualObject";
import { isServer } from "solid-js/web";

function App() {
  const [fileContent, setFileContent] = createSignal<object>({});

  if (!isServer) {
    var reader = new FileReader();
    
      reader.onload = (e) => {
        if (!e.target || !e.target.result) return;
        setFileContent(JSON.parse(e.target.result.toString()));
        alert("read!");
      };
    }


  const object = () => new VirtualObject(Object.entries(fileContent()));
  return (
    <>
      <div>
        <input
          onInput={(e) => reader.readAsText(e.target.files?.[0] as Blob)}
          type="file"
          id="input"
          accept=".json"
        />
      </div>

      <VirtualizedPanel object={object()} />
    </>
  );
}

export default App;
