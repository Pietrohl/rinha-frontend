import { JsonStreamTokenizer } from "./JsonStreamTokenizer";
import { VirtualList } from "./virtualList";
import { isServer } from "solid-js/web";

export function parseObject(file: File | undefined, object: VirtualList) {
  object.clear();
  const tokenizer = new JsonStreamTokenizer(object.push.bind(object));

  const utf8Decoder = new TextDecoder("utf-8");
  if (isServer) return null;

  if (!file) {
    return null;
  }

  let reminder = "";
  const stream = file.stream().getReader();
  stream
    .read()
    .then(async function processStream({ done, value }): Promise<any> {
      if (done) return;

      if (value) {
        const chunck = utf8Decoder.decode(value, { stream: true });
        tokenizer.processChunk(chunck);
        reminder += chunck;
      }

      return stream.read().then(processStream);
    })
    .then(() => {
      tokenizer.end();
    })
    .catch((e: Error) => {
      debugger;
      object.error = e.message;
    });
}
