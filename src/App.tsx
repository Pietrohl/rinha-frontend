import { createSignal, createEffect } from "solid-js";
import solidLogo from "./assets/solid.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = createSignal(0);
  const [fileContent, setFileContent] = createSignal<string | null>(null);


  const reader = new FileReader();


  reader.onload = (e) => {
    if(!e.target) return
    setFileContent(e.target.result as string);
    console.log("read!");
  };


  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={solidLogo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
      <h1>Vite + Solid</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>

        <div>
          <input
            onInput={(e) => reader.readAsText(e.target.files?.[0] as Blob)}
            type="file"
            id="input"
            accept=".json"
          />
        </div>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Solid logos to learn more
      </p>

      {fileContent()?.slice(0, 100)}
    </>
  );
}

export default App;
