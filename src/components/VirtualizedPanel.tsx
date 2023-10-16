import { For, createSignal } from "solid-js";
import { VirtualObject } from "../utils/virtualObject";
import ObjectViewer from "./ObjectViewer";

interface Props {
  object: object;
}
function VirtualizedPanel(props: Props) {
  const [scroll, setScroll] = createSignal<{
    scrollY: number;
  }>({ scrollY: 0 });

  const object = () => new VirtualObject(Object.entries(props.object));

  const lineHeight = 20;
  const viewportHeight = window.innerHeight * 0.8;
  const buffer = 500; 

  return (
    <>
      {object().items.filter((item) => item.show()).length}
      <div
        onscroll={(e) => {
          setScroll({
            scrollY: e.currentTarget.scrollTop,
          });
        }}
        style={{
          height: "80vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* this should be set to the total size of your virtualized area */}
        <For
          each={object().items.filter((item) => item.show())}
          fallback={<div>Loading...</div>}
        >
          {(item) => <ObjectViewer object={item.value} />}
        </For>
      </div>
    </>
  );
}

export default VirtualizedPanel;
