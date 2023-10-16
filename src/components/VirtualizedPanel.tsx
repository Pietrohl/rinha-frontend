import { For, createSignal } from "solid-js";

function VirtualizedPanel() {
  const [scroll, setScroll] = createSignal<{scrollX: number, scrollY: number}>({scrollX: 0, scrollY: 0});

  // Mock data: items with random sizes and positions
  const items = Array.from({ length: 1000 }).map(() => ({
    top: Math.random() * 5000, // random Y position
    left: Math.random() * 5000, // random X position
    height: 50 + Math.random() * 150, // random height between 50 and 200
    width: 50 + Math.random() * 150, // random width between 50 and 200
    content: "Item",
  }));

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const buffer = 500; // buffer for offscreen items

  const visibleItems = () =>
    items.filter((item) => {
      return (
        item.top + item.height > scroll().scrollY - buffer &&
        item.top < scroll().scrollY + viewportHeight + buffer &&
        item.left + item.width > scroll().scrollX - buffer &&
        item.left < scroll().scrollX + viewportWidth + buffer
      );
    });

  return (
    <div
      onscroll={(e) => {
        setScroll({scrollX: e.currentTarget.scrollLeft, scrollY: e.currentTarget.scrollTop});
      }}
      style={{
        height: "80vh",
        width: "80vw",
        overflow: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: "5000px", width: "5000px" }}>
        {" "}
        {/* this should be set to the total size of your virtualized area */}
        <For each={visibleItems()} fallback={<div>Loading...</div>}>
          {(item, index) => (
            <div
              style={{
                position: "absolute",
                top: item.top + "px",
                left: item.left + "px",
                height: item.height + "px",
                width: item.width + "px",
                background: "lightgray",
                border: "1px solid black",
              }}
            >
              item: {index()} {item.content}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default VirtualizedPanel;
