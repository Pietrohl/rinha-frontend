import path from "path";
import renderStatic from "solid-ssr/static";
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const PAGES = ["index"];
const pathToServer = path.resolve(__dirname, "lib/entry-server.js");
const pathToPublic = path.resolve(__dirname, "./");
const templateHTML = path.resolve(__dirname, "dist/index.html");

renderStatic(
  PAGES.map(p => ({
    entry: pathToServer,
    output: path.join(pathToPublic, `${p}.html`),
    url: p === "index" ? `/` : `/${p}`,
  }))
);
