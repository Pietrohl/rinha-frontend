/* @refresh reload */
import { hydrate, render } from "solid-js/web";

import "./index.css";
import App from "./App";

const root = document.getElementById("root");

import.meta.env.DEV ? render(() => <App />, root!) : hydrate(() => <App />, root!);
