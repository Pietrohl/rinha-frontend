import { Component, For, JSX } from "solid-js";
import { VirtualObject } from "../utils/virtualObject";

interface Props {
  object: VirtualObject;
}

const ObjectViewer: Component<Props> = (props: Props): JSX.Element => {
  return (
    <>
      {" "}
      {"{"}
      height = {props.object.height}
      <For
        each={props.object && props.object.items.filter((item) => item.show())}
        fallback={<div>Loading...</div>}
      >
        {(item) => {
          if (item.value instanceof VirtualObject)
            return (
              <div>
                {item.key}: <ObjectViewer object={item.value} />
              </div>
            );

          return (
            <div>
              {item.key}: {item.value}
            </div>
          );
        }}
      </For>
    </>
  );
};

export default ObjectViewer;
