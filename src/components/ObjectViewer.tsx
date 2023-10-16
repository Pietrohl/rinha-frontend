import { Component, For, JSX } from "solid-js";
import { VirtualList } from "../utils/virtualList";

interface Props {
  object: VirtualList;
}

const ObjectViewer: Component<Props> = (props: Props): JSX.Element => {
  return (
    <For
      each={props.object && props.object.computedItems}
      fallback={<div>Loading...</div>}
    >
      {(item) => {
        if (item.value instanceof VirtualList) {
          return (
            <div>
              {item.key}: <ObjectViewer object={item.value} />
            </div>
          );
        }

        return (
          <div>
            {item.key}: {item.value}
          </div>
        );
      }}
    </For>
  );
};

export default ObjectViewer;
