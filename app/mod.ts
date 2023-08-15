import manifest, { name } from "./manifest.gen.ts";
import type { Manifest } from "./manifest.gen.ts";
export { name };
import type { App, AppContext as AC } from "../deps.ts";
import type { Account } from "./utils/types.ts";

export interface State extends Account {}

export default function App(state: State): App<Manifest, State> {
  return {
    manifest,
    state,
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
