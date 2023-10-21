import { For, createMemo, createSignal } from "solid-js";
import { VirtualList } from "../utils/virtualList";
import { createScheduled, throttle } from "@solid-primitives/scheduled";
import { isServer } from "solid-js/web";
interface Props {
  object: VirtualList;
}
const scheduled = createScheduled((fn) => throttle(fn, 500));
const [scrollY, setScrollY] = createSignal<number>(0);

function VirtualizedPanel(props: Props) {
  const throttleScrollY = createMemo((p: number = 0) => {
    // track source signal
    const value = scrollY();
    // track the debounced signal and check if it's dirty
    return scheduled() ? value : p;
  });

  const lineHeight = 20;
  const viewportHeight = isServer ? 0 : window.innerHeight;
  const buffer = 500;

  return (
    <>
      <div
        onscroll={(e) => {
          setScrollY(e.currentTarget.scrollTop);
        }}
        style={{
          height: "80vh",
          width: "80vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* this should be set to the total size of your virtualized area */}
        <div
          style={{
            height: `${props.object.items.length * lineHeight}px`,
          }}
        >
          <For each={props.object.items}>
            {(item, index) => {
              console.log(item, "index: ", index());
              return <div>{index()}</div>;
            }}
          </For>
        </div>
      </div>
    </>
  );
}

export default VirtualizedPanel;
