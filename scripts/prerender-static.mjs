import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROUTES = [
  "/",
  "/about",
  "/updates",
  "/programs",
  "/membership",
  "/experts",
  "/resources",
  "/contact",
  "/search",
  "/testimonials",
  "/partners",
  "/voices-in-motion",
  "/privacy",
  "/terms",
  "/admin",
];

async function main() {
  const ssrPath = path.resolve(process.cwd(), ".output/server/_ssr/ssr.mjs");
  const publicDir = path.resolve(process.cwd(), ".output/public");

  if (!fs.existsSync(ssrPath)) {
    console.error(`❌ SSR module not found at ${ssrPath}. Run 'npm run build' first.`);
    process.exit(1);
  }

  const { default: ssrHandler } = await import(pathToFileURL(ssrPath).href);

  console.log("⚡ Pre-rendering static HTML for all routes...");

  for (const route of ROUTES) {
    try {
      const url = `http://localhost${route}`;
      const response = await ssrHandler.fetch(new Request(url));
      const html = await response.text();

      if (response.status !== 200 && response.status !== 302 && response.status !== 307) {
        console.warn(`⚠️ Warning: Route ${route} returned status ${response.status}`);
      }

      if (route === "/") {
        fs.writeFileSync(path.join(publicDir, "index.html"), html, "utf-8");
        console.log(`  ✓ / -> .output/public/index.html (${html.length} bytes)`);
      } else {
        const routeClean = route.replace(/^\/+/, "");
        const routeDir = path.join(publicDir, routeClean);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
        fs.writeFileSync(path.join(publicDir, `${routeClean}.html`), html, "utf-8");
        console.log(`  ✓ ${route} -> .output/public/${routeClean}/index.html`);
      }
    } catch (err) {
      console.error(`❌ Failed to pre-render route ${route}:`, err);
    }
  }

  console.log("✅ Static pre-rendering completed successfully!");
}

main();
