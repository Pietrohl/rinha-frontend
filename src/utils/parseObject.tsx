import { JsonStreamTokenizer } from "./JsonStreamTokenizer";
import { VirtualObject } from "./virtualObject";
import { isServer } from "solid-js/web";

export const tokenizer = new JsonStreamTokenizer();

export const parseObject = async (file: File | undefined) => {
  const utf8Decoder = new TextDecoder("utf-8");
  let result;
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
      result = new VirtualObject(Object.entries(JSON.parse(reminder)));
      console.log("End of stream");
      console.log("Time taken: ", Math.round((Date.now() - startTime) / 1000));
    });

  return result;
};
