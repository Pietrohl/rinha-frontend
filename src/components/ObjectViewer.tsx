// import { Accessor, Component, For, JSX } from "solid-js";
// import { VirtualList } from "../utils/virtualList";
// import { useVirtualPanel } from "./VirtualizedPanel";
// import "./ObjectViewer.css";
// interface Props {
//   object: VirtualList;
//   key: string;
// }

// const ObjectViewer: Component<Props> = (props: Props): JSX.Element => {
//   const [scrollY, { lineHeight, viewportHeight, buffer }] =
//     useVirtualPanel() as [
//       Accessor<number>,
//       { lineHeight: number; viewportHeight: number; buffer: number }
//     ];

//   return (
//     <>
//       <details
//         open
//         class={`object ${props.object.type === "array" ? "object-array" : ""}`}
//       >
//         <summary>
//           {props.key}: 
//         </summary>

//         <For each={props.object.items} fallback={<div>Loading...</div>}>
//           {(item) => {
//             if (item.value instanceof VirtualList)
//               return <ObjectViewer key={item.key} object={item.value} />;

//             return (
//               <p class='parameter' style={{ height: `${lineHeight}` }}>
//                 {item.key}: <span>{item.value}</span>
//               </p>
//             );
//           }}
//         </For>
//       </details>
//     </>
//   );
// };

// export default ObjectViewer;
