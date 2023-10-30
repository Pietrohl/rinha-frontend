import { For, createMemo, createSignal } from "solid-js";
import { createScheduled, throttle } from "@solid-primitives/scheduled";
import { isServer } from "solid-js/web";
import { Token } from "../utils/JsonStreamTokenizer";
import "./VirtualizedPanel.css";
// import { isServer } from "solid-js/web";
interface Props {
  list: Token[];
}
const scheduled = createScheduled((fn) => throttle(fn, 200));
const [scrollY, setScrollY] = createSignal<number>(0);

function VirtualizedPanel(props: Props) {
  const throttleScrollY = createMemo((p: number = 0) => {
    const value = scrollY();
    return scheduled() ? value : p;
  });

  const lineHeight = 28.244;
  const viewportHeight = isServer ? 0 : window.innerHeight;
  const buffer = 500;
  const start = () =>
    Math.max(1, Math.floor((throttleScrollY() - buffer) / lineHeight));
  const end = () =>
    Math.min(Math.floor((viewportHeight + throttleScrollY() + buffer) / lineHeight), props.list.length - 1);

  const classMap = {
    BEGIN_ARRAY: "object-array",
    END_ARRAY: "object-array-end",
    BEGIN_OBJECT: "object-object",
    END_OBJECT: "object-object-end",
    STRING: "object-string",
    NUMBER: "object-number",
    BOOLEAN: "object-boolean",
    NULL: "object-null",
  };

  return (
    <>
      <div
        onscroll={(e) => {
          setScrollY(e.currentTarget.scrollTop);
        }}
        style={{
          height: "80vh",
          "min-width": "90vh",
          overflow: "auto auto",
        }}
      >
        <div
          style={{
            height: `${props.list.length * lineHeight}px`,
            position: "relative",
            "font-family": "inherit",
            display: "block",
            overflow: "auto",
          }}
        >
          <br />
          <For each={props.list.slice(start(), end())}>
            {(item, index) => {
              let padding = "";

              for (let i = 0; i < item.depth; i++) {
                padding.concat(`<span></span>`);
              }

              return (
                <div
                  class={`object ${classMap[item.type]}`}
                  style={{
                    padding: "0",
                    display: "flex",
                    position: "absolute",
                    top: `${(item.index || index()) * lineHeight}px`,
                  }}
                >
                  <For each={Array(item.depth - 1)} fallback={""}>
                    {() => <span class="padding"></span>}
                  </For>

                  {item.key !== undefined ? (
                    <span
                      {...{
                        class: `key ${
                          Number.isInteger(item.key) ? "array-key" : ""
                        }`,
                      }}
                    >
                      {item.key}:{" "}
                    </span>
                  ) : (
                    ""
                  )}
                  {item.type !== "BOOLEAN" && item.value ? (
                    <span class="value">{item.value}</span>
                  ) : (
                    ""
                  )}
                  {item.type === "BOOLEAN" ? (
                    item.value ? (
                      <span class="value">true</span>
                    ) : (
                      <span>false</span>
                    )
                  ) : (
                    ""
                  )}
                  {item.type === "NULL" ? <span class="value">null</span> : ""}
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </>
  );
}

export default VirtualizedPanel;
