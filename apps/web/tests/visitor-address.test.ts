// Run after `npm run build -w @aihot/web`. The visitor's address the web server hands the api under each
// TRUST_PROXY setting: only the header of the proxy actually in front is believed.
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const api = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ forwarded: req.headers["x-forwarded-for"], real: req.headers["x-real-ip"] }));
});
const webs: ChildProcess[] = [];

async function startWeb(trustProxy: string): Promise<string> {
  const web = spawn(process.execPath, [fileURLToPath(new URL("../server.ts", import.meta.url))], {
    env: { ...process.env, WEB_PORT: "0", TRUST_PROXY: trustProxy, API_BASE_URL: `http://127.0.0.1:${(api.address() as AddressInfo).port}` },
    stdio: ["ignore", "pipe", "pipe"],
  });
  webs.push(web);
  let logs = "";
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`web did not start: ${logs}`)), 15_000);
    web.on("exit", () => { clearTimeout(timeout); reject(new Error(`web exited: ${logs}`)); });
    web.stderr!.on("data", (chunk) => { logs += String(chunk); });
    web.stdout!.on("data", (chunk) => {
      logs += String(chunk);
      const match = logs.match(/"msg":"web started","port":(\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(`http://127.0.0.1:${match[1]}`);
      }
    });
  });
}

before(async () => {
  api.listen(0, "127.0.0.1");
  await once(api, "listening");
});

after(async () => {
  for (const web of webs) {
    if (web.exitCode !== null) continue;
    web.kill("SIGTERM");
    await once(web, "exit");
  }
  api.closeAllConnections();
  await new Promise<void>((resolve) => api.close(() => resolve()));
});

/** Every address a visitor might claim for itself. */
const claimed = { "X-Forwarded-For": "6.6.6.6, 7.7.7.7", "X-Real-IP": "6.6.6.6", "CF-Connecting-IP": "8.8.8.8" };

async function seenByApi(origin: string, headers: Record<string, string>) {
  const res = await fetch(`${origin}/api/site/echo-client`, { headers });
  return res.json();
}

test("without a trusted proxy no header names the visitor", async () => {
  const origin = await startWeb("false");
  assert.deepEqual(await seenByApi(origin, claimed), { forwarded: "127.0.0.1", real: "127.0.0.1" });
});

test("behind Caddy or nginx the proxy's last X-Forwarded-For entry is the visitor", async () => {
  const origin = await startWeb("true");
  assert.deepEqual(await seenByApi(origin, claimed), { forwarded: "7.7.7.7", real: "7.7.7.7" });
});

test("behind Cloudflare CF-Connecting-IP is the visitor and X-Forwarded-For is not believed", async () => {
  const origin = await startWeb("cloudflare");
  assert.deepEqual(await seenByApi(origin, claimed), { forwarded: "8.8.8.8", real: "8.8.8.8" });
  const { "CF-Connecting-IP": _cloudflare, ...notThroughCloudflare } = claimed;
  assert.deepEqual(await seenByApi(origin, notThroughCloudflare), { forwarded: "127.0.0.1", real: "127.0.0.1" }, "no CF-Connecting-IP: the connection's own address");
});
