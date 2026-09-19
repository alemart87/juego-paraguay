import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
  closeSync,
} from "node:fs";
import { join } from "node:path";

/** Manage only our recorded preview process; never kill an arbitrary port owner. */
export async function windowsPreview(root, action) {
  const pidFile = join(root, ".grok", "preview-windows.pid");
  const logFile = join(root, ".grok", "preview-windows.log");
  const wrapper = join(root, "scripts", "with-app-env.mjs");
  if (existsSync(pidFile)) {
    const pid = Number(readFileSync(pidFile, "utf8").trim());
    if (Number.isInteger(pid) && pid > 1) {
      const query = spawnSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          `(Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}' -ErrorAction SilentlyContinue).CommandLine`,
        ],
        { encoding: "utf8", windowsHide: true },
      );
      const cmd = query.stdout ?? "";
      if (cmd.toLowerCase().includes(wrapper.toLowerCase()) && /vite\s+preview/.test(cmd)) {
        spawnSync("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
          windowsHide: true,
          stdio: "ignore",
        });
      }
    }
    rmSync(pidFile, { force: true });
  }
  if (action === "stop") {
    console.log("[preview] Windows preview stopped.");
    return 0;
  }
  try {
    await fetch("http://127.0.0.1:8081/", { signal: AbortSignal.timeout(700) });
    console.error("[preview] Port 8081 is already occupied by an unowned process.");
    return 1;
  } catch {
    /* available */
  }
  mkdirSync(join(root, ".grok"), { recursive: true });
  const log = openSync(logFile, "a");
  const child = spawn(process.execPath, [wrapper, "vite", "preview"], {
    cwd: root,
    windowsHide: true,
    detached: true,
    stdio: ["ignore", log, log],
  });
  closeSync(log);
  child.unref();
  let failure = "";
  child.on("error", (e) => {
    failure = e.message;
  });
  if (child.pid) writeFileSync(pidFile, String(child.pid));
  for (let i = 0; i < 100 && !failure; i++) {
    try {
      const response = await fetch("http://127.0.0.1:8081/", { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        console.log("[preview] Serving http://127.0.0.1:8081/");
        return 0;
      }
    } catch {
      /* wait for server */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.error("[preview] Failed to start:", failure || `see ${logFile}`);
  return 1;
}
