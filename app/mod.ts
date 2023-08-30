import manifest from "./manifest.gen.ts";
import type { Manifest } from "./manifest.gen.ts";
import type { App, AppContext as AC } from "../deps.ts";
import type { Account } from "./utils/types.ts";

export interface State extends Account {}

export type MyApp = App<Manifest, State>;
export default function App(state: State): MyApp {
  return {
    manifest,
    state,
  };
}

export type AppContext = AC<MyApp>;
const { name } = manifest;
export { name };
