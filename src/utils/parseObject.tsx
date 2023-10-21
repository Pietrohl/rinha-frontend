import { JsonStreamTokenizer } from "./JsonStreamTokenizer";
import { VirtualList } from "./virtualList";
import { isServer } from "solid-js/web";

export const parseObject = async (file: File | undefined) => {
  const object = new VirtualList();
  const tokenizer = new JsonStreamTokenizer(object.push.bind(object));

  const utf8Decoder = new TextDecoder("utf-8");
  if (isServer) return null;

  if (!file) {
    return null;
  }

  let reminder = "";
  const stream = file.stream().getReader();
  const startTime = Date.now();
  await stream
    .read()
    .then(function processStream({ done, value }): any {
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
      console.log("End of stream");
      console.log(object);
      console.log("Time taken: ", Math.round((Date.now() - startTime) / 1000));
    });

  return object;
};
