declare module 'vite-plugin-prerenderer' {
  import type { Plugin } from 'vite';

  export interface PrerenderSeoOption {
    title?: string;
    keyWords?: string | string[];
    description?: string;
  }

  export interface VitePluginPrerendererConfig {
    routes: string[];
    options?: Record<string, PrerenderSeoOption>;
  }

  export default function vitePluginPrerenderer(config: VitePluginPrerendererConfig): Plugin;
}
