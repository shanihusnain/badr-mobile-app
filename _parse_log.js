const fs = require("fs");
const t = fs.readFileSync(".expo/dev/logs/start.log", "utf8");
const routes = new Set();
for (const line of t.split("\n")) {
  if (!line.includes("missing the required default")) continue;
  const idx = line.indexOf('Route "');
  if (idx === -1) continue;
  const start = idx + 7;
  const end = line.indexOf('"', start);
  if (end === -1) continue;
  routes.add(line.slice(start, end));
}
console.log("Routes missing default export:");
console.log([...routes].sort().join("\n"));
