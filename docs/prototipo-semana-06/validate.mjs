const cdpPort = process.env.CDP_PORT ?? "9333";
const baseUrl = process.env.PROTOTYPE_URL ?? "http://127.0.0.1:8765/docs/prototipo-semana-06/";
const pages = [
  "login.html",
  "cadastro.html",
  "index.html",
  "clube.html",
  "livros.html",
  "livro.html",
  "encontros.html",
  "encontro.html",
  "perfil.html",
];
const widths = [1280, 640, 320];
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function connect() {
  const targets = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then((response) => response.json());
  const target = targets.find((item) => item.type === "page");
  if (!target) throw new Error("Nenhuma página disponível no Chromium.");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    (listeners.get(message.method) ?? []).forEach((listener) => listener(message.params));
  });
  return {
    close: () => socket.close(),
    on(method, listener) {
      listeners.set(method, [...(listeners.get(method) ?? []), listener]);
    },
    call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function main() {
  const cdp = await connect();
  const errors = [];
  const results = [];
  cdp.on("Runtime.exceptionThrown", ({ exceptionDetails }) => errors.push(exceptionDetails.text));
  cdp.on("Log.entryAdded", ({ entry }) => {
    if (entry.level === "error") errors.push(entry.text);
  });
  await Promise.all([cdp.call("Page.enable"), cdp.call("Runtime.enable"), cdp.call("Log.enable")]);

  async function evaluate(expression) {
    const result = await cdp.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  async function navigate(page) {
    await cdp.call("Page.navigate", { url: new URL(page, baseUrl).href });
    await delay(250);
  }

  for (const width of widths) {
    await cdp.call("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const page of pages) {
      await navigate(page);
      const summary = await evaluate(`(() => {
        const ids = [...document.querySelectorAll('[id]')].map((item) => item.id);
        const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
        const fields = [...document.querySelectorAll('input, select, textarea')];
        const unlabeledFields = fields.filter((field) => !field.labels?.length && !field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')).map((field) => field.id || field.name || field.tagName);
        const unnamedControls = [...document.querySelectorAll('button, a[href]')].filter((control) => {
          const imageAlt = [...control.querySelectorAll('img')].map((image) => image.alt).join(' ');
          return !(control.getAttribute('aria-label') || control.getAttribute('aria-labelledby') || control.textContent.trim() || imageAlt.trim());
        }).map((control) => control.outerHTML.slice(0, 120));
        const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((heading) => Number(heading.tagName[1]));
        const skippedHeading = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1);
        return {
          language: document.documentElement.lang,
          title: document.title,
          h1Count: document.querySelectorAll('h1').length,
          mainCount: document.querySelectorAll('main').length,
          duplicateIds,
          unlabeledFields,
          unnamedControls,
          skippedHeading,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
        };
      })()`);
      const failures = [];
      if (summary.language !== "pt-BR") failures.push("idioma");
      if (!summary.title.includes("LendoJuntos")) failures.push("título");
      if (summary.h1Count !== 1) failures.push(`h1=${summary.h1Count}`);
      if (summary.mainCount !== 1) failures.push(`main=${summary.mainCount}`);
      if (summary.duplicateIds.length) failures.push(`ids=${summary.duplicateIds.join(",")}`);
      if (summary.unlabeledFields.length) failures.push(`campos=${summary.unlabeledFields.join(",")}`);
      if (summary.unnamedControls.length) failures.push("controle sem nome");
      if (summary.skippedHeading) failures.push("hierarquia de títulos");
      if (summary.horizontalOverflow) failures.push(`overflow=${summary.scrollWidth}/${summary.clientWidth}`);
      if (summary.brokenImages.length) failures.push("imagem quebrada");
      results.push({ page, width, failures });
    }
  }

  await cdp.call("Emulation.clearDeviceMetricsOverride");
  await navigate("index.html");
  const dialogCheck = await evaluate(`(async () => {
    const opener = document.querySelector('[data-open-dialog="criar-clube"]');
    opener.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const dialog = document.querySelector('#criar-clube');
    const opened = dialog.open;
    const initialFocus = document.activeElement?.id;
    dialog.close('test');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return { opened, initialFocus, returnedToOpener: document.activeElement === opener };
  })()`);
  if (!dialogCheck.opened || dialogCheck.initialFocus !== "nome-clube" || !dialogCheck.returnedToOpener) {
    errors.push(`Diálogo: ${JSON.stringify(dialogCheck)}`);
  }

  await navigate("clube.html");
  const menuCheck = await evaluate(`(() => {
    const menu = document.querySelector('[data-menu]');
    const summary = menu.querySelector('summary');
    summary.click();
    summary.focus();
    summary.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return { closed: !menu.open, focusReturned: document.activeElement === summary };
  })()`);
  if (!menuCheck.closed || !menuCheck.focusReturned) errors.push(`Menu: ${JSON.stringify(menuCheck)}`);

  const failedPages = results.filter((result) => result.failures.length);
  console.log(JSON.stringify({ baseUrl, checks: results.length, failedPages, dialogCheck, menuCheck, runtimeErrors: errors }, null, 2));
  cdp.close();
  if (failedPages.length || errors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
