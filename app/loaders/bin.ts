import { AppContext } from "../mod.ts";

export default function GetBin(
  _props: unknown,
  _req: Request,
  ctx: AppContext
): Promise<AppContext> {
  return new Promise((resolve) => {
    resolve({ ctx });
  });
}
