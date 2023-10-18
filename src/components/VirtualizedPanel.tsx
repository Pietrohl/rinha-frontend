import {
  createContext,
  createMemo,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import { VirtualObject } from "../utils/virtualObject";
import ObjectViewer from "./ObjectViewer";
import { createScheduled, throttle } from "@solid-primitives/scheduled";
import { isServer } from "solid-js/web";
interface Props {
  object: VirtualObject;
}
const [scrollY, setScrollY] = createSignal<number>(0);
const scheduled = createScheduled((fn) => throttle(fn, 500));

const VirtualPanelContext = createContext();

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

  onMount(() => {
    setScrollY(0);
  });

  const panel = [throttleScrollY, { lineHeight, viewportHeight, buffer }];

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
            height: `${props.object.height * lineHeight}px`,
          }}
        >
          <VirtualPanelContext.Provider value={panel}>
            <ObjectViewer key="AllTypes" object={props.object} />
          </VirtualPanelContext.Provider>
        </div>
      </div>
    </>
  );
}

export function useVirtualPanel() {
  const context = useContext(VirtualPanelContext);

  if (!context)
    throw new Error("useVirtualPanel must be used within a VirtualizedPanel");

  return context;
}

export default VirtualizedPanel;
