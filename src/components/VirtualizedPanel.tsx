import { For, createMemo, createSignal, untrack } from "solid-js";
import { isServer } from "solid-js/web";
import { Token } from "../utils/JsonStreamTokenizer";
import "./VirtualizedPanel.css";
// import { isServer } from "solid-js/web";
interface Props {
  list: Token[];
}

const classMap = {
  BEGIN_ARRAY: "object-array",
  END_ARRAY: "object-array-end",
  BEGIN_OBJECT: "object-object",
  END_OBJECT: "object-object-end",
  STRING: "object-string",
  NUMBER: "object-number",
  BOOLEAN: "object-boolean",
  NULL: "object-null",
  end: "",
  error: "",
};

const lineHeight = 28.244;
const buffer = 500;
const viewportHeight = isServer ? 0 : window.innerHeight;

function VirtualizedPanel(props: Props) {
  const T = createMemo(() => props.list.length * lineHeight);
  const H = createMemo(() => Math.min(T(), 50000000));
  const K = createMemo(() => (T() / (T() - H() + 1)) * 0.99);

  const n = createMemo(() => Math.ceil(T() / (H() * K() - T() * (K() - 1))));
  const P = createMemo(() => T() / n());
  const J = () => (T() - H()) / Math.max(n() - 1, 1);

  const [prevScrollTop, setPrevScrollTop] = createSignal(0);

  const [page, setPage] = createSignal(0);
  const offset = createMemo(() => page() * J());

  let container;

  const onScroll = (scroll: number) => {
    // Jump Scroll
    if (Math.abs(untrack(prevScrollTop) - scroll) > viewportHeight) {
      const page = Math.min(
        Math.floor(
          scroll *
            ((untrack(T) - viewportHeight) / (H() - viewportHeight)) *
            (1 / untrack(P))
        ),
        untrack(n) - 1
      );
      setPage(page);
      setPrevScrollTop(scroll);
    } else {
      // Next Page
      if (scroll + untrack(offset) > (untrack(page) + 1) * untrack(P)) {
        setPage(untrack(page) + 1);
        const nextScroll = scroll - untrack(J);
        setPrevScrollTop(nextScroll);
        container!.scrollTop = nextScroll;

        // Previous Page
      } else if (scroll + untrack(offset) < untrack(page) * untrack(P)) {
        setPage(untrack(page) - 1);
        const nextScroll = scroll + untrack(J);
        setPrevScrollTop(nextScroll);
        container!.scrollTop = nextScroll;
      } else {
        setPrevScrollTop(scroll);
      }
    }
  };
  const end = () =>
    Math.min(
      Math.floor(
        (viewportHeight + prevScrollTop() + offset() + buffer) / lineHeight
      ),
      props.list.length - 1
    );

  const start = () =>
    Math.min(
      Math.max(
        1,
        Math.floor((prevScrollTop() + offset() - buffer) / lineHeight)
      ),
      props.list.length - 100
    );

  return (
    <>
      <div
        ref={container}
        onscroll={(e) => {
          onScroll(e.currentTarget.scrollTop);
        }}
        style={{
          height: "80vh",
          "min-width": "90vh",
          overflow: "auto auto",
        }}
      >
        {/* <div style={{ top: 0, position: "absolute", right: "20px" }}>
          T: {T()}
          <br />
          H: {H()}
          <br />
          K: {K()}
          <br />
          n: {n()}
          <br />
          P: {P()}
          <br />
          J: {J()}
          <br />
          page: {page()}
          <br />
          offset: {offset()}
          <br />
          scrollTop: {prevScrollTop()}
          <br />
          start: {start()}
          <br />
          end: {end()}
          <br />
          viewportHeight: {viewportHeight}
          <br />
        </div> */}

        <div
          style={{
            height: `${H()}px`,
            position: "relative",
            "font-family": "inherit",
            display: "block",
            // overflow: "auto",
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
                  tabIndex={0}
                  class={`object ${classMap[item.type]}`}
                  style={{
                    padding: "0",
                    display: "flex",
                    position: "absolute",
                    top: `${(item.index || index()) * lineHeight - offset()}px`,
                  }}
                >
                  <For each={Array(Math.max(0, item.depth - 1))} fallback={""}>
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
