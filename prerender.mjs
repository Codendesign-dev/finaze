// Injects the server-rendered first view into dist/index.html after `vite build`
// and `vite build --ssr` have run (see the "build" script in package.json).
import fs from "node:fs";

const { render } = await import("./dist-ssr/entry-server.js");
const file = "dist/index.html";
const html = fs.readFileSync(file, "utf8");
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error(`${marker} not found in ${file}`);
fs.writeFileSync(file, html.replace(marker, `<div id="root">${render()}</div>`));
fs.rmSync("dist-ssr", { recursive: true, force: true });
console.log("prerendered dist/index.html");
