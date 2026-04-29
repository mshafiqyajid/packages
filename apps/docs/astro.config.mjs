import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [react(), mdx()],
  output: "static",
  site: "https://mshafiqyajid-packages.vercel.app",
});
