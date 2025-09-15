declare module "@vitejs/plugin-react-swc" {
  import type { Plugin } from "vite";

  export type ReactPluginOptions = Record<string, unknown>;

  export default function react(options?: ReactPluginOptions): Plugin;
  export function pluginForCjs(options?: ReactPluginOptions): Plugin;
}
