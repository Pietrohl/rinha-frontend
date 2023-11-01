import { generateHydrationScript, renderToStringAsync } from "solid-js/web";
import fs from "fs";
import path from "path";

import App from "./App";
export default () => {
  return renderToStringAsync(() => <App />).then((html) => {
    return fs
      .readFileSync(path.join(process.cwd(), "docs/index.html"), "utf-8")
      .replace("<!--#include HydrationScript -->", generateHydrationScript())
      .replace("<!--#include App -->", html);
  });
};
