import { Accessor, Component, For, JSX } from "solid-js";
import { VirtualObject } from "../utils/virtualObject";
import { useVirtualPanel } from "./VirtualizedPanel";

interface Props {
  object: VirtualObject;
}

const ObjectViewer: Component<Props> = (props: Props): JSX.Element => {
  const [scrollY, { lineHeight, viewportHeight, buffer }] =
    useVirtualPanel() as [
      Accessor<number>,
      { lineHeight: number; viewportHeight: number; buffer: number }
    ];

  return (
    <>
      <For
        each={props.object.items.filter(
          (item) =>
            item.lineIndex * lineHeight < scrollY() + viewportHeight + buffer ||
            (item.lineIndex + item.height) * lineHeight < scrollY() - buffer
        )}
        fallback={<div>Loading...</div>}
      >
        {(item) => {
          if (item.value instanceof VirtualObject)
            return (
              <div style={{ height: `${lineHeight}` }}>
                {item.lineIndex} {item.key}: {`{`}{" "}
                <ObjectViewer object={item.value} /> {`}`}
              </div>
            );

          return (
            <div style={{ height: `${lineHeight}` }}>
              {item.lineIndex} {item.key}: {item.value}
            </div>
          );
        }}
      </For>
    </>
  );
};

export default ObjectViewer;
