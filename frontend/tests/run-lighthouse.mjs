import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const baseUrl = "http://127.0.0.1:4173";
const outputDirectory = new URL("../test-results/lighthouse/", import.meta.url);
const viteEntry = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const server = spawn(process.execPath, [viteEntry, "preview", "--host", "127.0.0.1", "--port", "4173"], {
  stdio: "ignore",
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // O servidor ainda está iniciando.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("O preview do Vite não iniciou em tempo hábil.");
}

let chrome;
try {
  await waitForServer();
  await mkdir(outputDirectory, { recursive: true });

  for (const [name, path] of [["login", "/"], ["cadastro", "/register"]]) {
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        "--headless=new",
        "--no-sandbox",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--window-size=1280,900",
      ],
    });
    const result = await lighthouse(`${baseUrl}${path}`, {
        port: chrome.port,
        output: "json",
        onlyCategories: ["accessibility"],
        logLevel: "error",
      });
    await chrome.kill();
    chrome = undefined;
    if (!result) throw new Error(`Lighthouse não retornou resultado para ${name}.`);
    if (result.lhr.runtimeError) {
      throw new Error(`${name}: ${result.lhr.runtimeError.code} — ${result.lhr.runtimeError.message}`);
    }

    const score = result.lhr.categories.accessibility.score ?? 0;
    const manualAudits = Object.values(result.lhr.audits)
      .filter((audit) => audit.scoreDisplayMode === "manual")
      .map((audit) => ({ id: audit.id, title: audit.title, description: audit.description }));
    const failedAudits = Object.values(result.lhr.audits)
      .filter((audit) => audit.scoreDisplayMode === "binary" && audit.score === 0)
      .map((audit) => ({ id: audit.id, title: audit.title }));

    await writeFile(new URL(`${name}.json`, outputDirectory), JSON.stringify({ score, failedAudits, manualAudits }, null, 2));
    console.log(`${name}: acessibilidade ${Math.round(score * 100)}, ${manualAudits.length} itens manuais.`);
    if (failedAudits.length) throw new Error(`${name}: ${failedAudits.length} auditoria(s) automática(s) falharam.`);
  }
} finally {
  if (chrome) await chrome.kill();
  server.kill();
}
