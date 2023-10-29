import { For, createMemo, createSignal } from "solid-js";
import { createScheduled, throttle } from "@solid-primitives/scheduled";
import { isServer } from "solid-js/web";
import { Token } from "../utils/JsonStreamTokenizer";
// import { isServer } from "solid-js/web";
interface Props {
  list: Token[];
}
const scheduled = createScheduled((fn) => throttle(fn, 200));
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
  const start = () => Math.max(
    1,
    Math.floor((throttleScrollY() - buffer) / lineHeight)
  );
  const end =() => Math.floor(
    (viewportHeight + throttleScrollY() + buffer) / lineHeight
  );

  return (
    <>
      <div
        onscroll={(e) => {
          setScrollY(e.currentTarget.scrollTop);
        }}
        style={{
          height: "80vh",
          "min-width": "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            height: `${props.list.length * lineHeight}px`,
          }}
        >
          <br />
          <For each={props.list.slice(start(), end())}>
            {(item, index) => (
              <div
                class={`object ${
                  item.type === "BEGIN_ARRAY" ? "object-array" : ""
                }`}
                style={{
                  "padding-left": `${(item.depth - 1) * 12}px`,
                  position: "absolute",
                  top: `${(item.index || index()) * lineHeight}px`,
                }}
              >
                <span>{item.key}:</span>
                {item.value}
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  );
}

export default VirtualizedPanel;
