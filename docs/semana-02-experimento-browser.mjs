/**
 * Experimento reproduzivel da Semana 2.
 *
 * Pre-requisito: iniciar Chromium/Edge com --remote-debugging-port=9222 e
 * executar a aplicacao em http://localhost:4173 com os dados de demonstracao.
 * O script nao altera dados da aplicacao; ele autentica, percorre rotas,
 * simula teclado e emula viewports/forced-colors pelo Chrome DevTools Protocol.
 */

const cdpPort = process.env.CDP_PORT ?? "9222";
const baseUrl = process.env.LENDOJUNTOS_URL ?? "http://localhost:4173";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function connect() {
  const targets = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then((response) => response.json());
  const target = targets.find((item) => item.type === "page" && item.url.startsWith(baseUrl))
    ?? targets.find((item) => item.type === "page");
  if (!target) throw new Error("Nenhum alvo do tipo page foi encontrado no Chromium.");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    close: () => socket.close(),
    call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

function keyParams(type, key, code, modifiers = 0) {
  const keyCode = key === "Tab" ? 9 : key === "Enter" ? 13 : key === "Escape" ? 27 : 0;
  return { type, key, code, modifiers, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
}

async function main() {
  const cdp = await connect();
  const call = cdp.call;
  await Promise.all([call("Page.enable"), call("Runtime.enable"), call("DOM.enable"), call("Accessibility.enable")]);

  async function evaluate(expression) {
    const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      const details = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
      throw new Error(details);
    }
    return result.result.value;
  }

  async function navigate(path) {
    await call("Page.navigate", { url: `${baseUrl}${path}` });
    await delay(900);
  }

  async function press(key, code = key, modifiers = 0) {
    await call("Input.dispatchKeyEvent", keyParams(key === "Enter" ? "rawKeyDown" : "keyDown", key, code, modifiers));
    if (key === "Enter") {
      await call("Input.dispatchKeyEvent", {
        ...keyParams("char", key, code, modifiers),
        text: "\r",
        unmodifiedText: "\r",
      });
    }
    await call("Input.dispatchKeyEvent", keyParams("keyUp", key, code, modifiers));
    await delay(80);
  }

  async function typeText(value) {
    for (const character of value) {
      const keyCode = character.toUpperCase().codePointAt(0);
      await call("Input.dispatchKeyEvent", {
        type: "char",
        key: character,
        code: "",
        text: character,
        unmodifiedText: character,
        windowsVirtualKeyCode: keyCode,
        nativeVirtualKeyCode: keyCode,
      });
    }
  }

  async function activeElement() {
    return evaluate(`(() => {
      const element = document.activeElement;
      if (!element) return null;
      const text = element.getAttribute('aria-label') || element.innerText || element.value || element.getAttribute('placeholder') || '';
      const style = getComputedStyle(element);
      return {
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        text: text.trim().replace(/\\s+/g, ' ').slice(0, 90),
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
      };
    })()`);
  }

  async function tabSequence(count) {
    const items = [];
    for (let index = 0; index < count; index += 1) {
      await press("Tab");
      items.push(await activeElement());
    }
    return items;
  }

  if (process.env.NVDA_SETUP === "1") {
    await navigate(process.env.NVDA_PATH ?? "/");
    const selector = process.env.NVDA_FOCUS_SELECTOR ?? "body";
    const focused = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      element.focus();
      return document.activeElement === element;
    })()`);
    console.log(JSON.stringify({ path: await evaluate("location.pathname"), selector, focused }));
    cdp.close();
    return;
  }

  async function pageSummary(path) {
    await navigate(path);
    return evaluate(`(() => ({
      path: location.pathname,
      documentTitle: document.title,
      h1: [...document.querySelectorAll('h1')].map((item) => item.innerText.trim()),
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((item) => ({ level: Number(item.tagName[1]), text: item.innerText.trim().replace(/\\s+/g, ' ') })),
      landmarks: [...document.querySelectorAll('header,nav,main,aside,footer,[role="banner"],[role="navigation"],[role="main"],[role="complementary"],[role="contentinfo"]')].map((item) => item.getAttribute('role') || item.tagName.toLowerCase()),
      controls: [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].length,
      images: [...document.images].map((item) => ({ src: new URL(item.src).pathname, alt: item.alt })),
    }))()`);
  }

  const publicPages = [await pageSummary("/"), await pageSummary("/register")];
  await navigate("/");
  const loginTabs = await tabSequence(4);

  // Volta ao primeiro campo, digita as credenciais e envia o formulario pelo teclado.
  await evaluate("document.querySelector('input[type=email]').focus()");
  await typeText("ana@lendojuntos.test");
  await press("Tab");
  await typeText("123456");
  await press("Tab");
  await press("Enter");
  await delay(1200);
  const loginResult = await evaluate("({ path: location.pathname, h1: document.querySelector('h1')?.innerText ?? null })");

  await evaluate("document.body.focus()");
  const dashboardTabs = await tabSequence(10);

  const modalTrigger = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((item) => item.innerText.trim() === 'Criar clube');
    if (!button) {
      const values = [...document.querySelectorAll('input')].map((item) => item.value).join('|');
      const feedback = document.querySelector('.feedback')?.innerText ?? '';
      throw new Error('Botao Criar clube nao encontrado em ' + location.pathname + '; campos=' + values + '; feedback=' + feedback);
    }
    button.focus();
    button.click();
    return true;
  })()`);
  await delay(150);
  const modalInitialFocus = await activeElement();
  const modalTabs = await tabSequence(6);
  const dialogAccessibility = await evaluate(`(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog ? {
      ariaLabel: dialog.getAttribute('aria-label'),
      ariaLabelledby: dialog.getAttribute('aria-labelledby'),
      textHeading: dialog.querySelector('h2')?.innerText ?? null,
    } : null;
  })()`);
  const documentNode = await call("DOM.getDocument");
  const dialogNode = await call("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector: '[role="dialog"]' });
  const dialogAxTree = dialogNode.nodeId
    ? await call("Accessibility.getPartialAXTree", { nodeId: dialogNode.nodeId, fetchRelatives: false })
    : { nodes: [] };
  const dialogAx = dialogAxTree.nodes.map((node) => ({ role: node.role?.value ?? null, name: node.name?.value ?? null }));
  await press("Escape");
  const focusAfterEscape = await activeElement();

  const routes = [
    "/dashboard",
    "/clubs/1",
    "/clubs/1/books",
    "/books/1",
    "/clubs/1/meetings",
    "/clubs/1/meetings/1",
    "/profile",
  ];
  const reflowRoutes = ["/", "/register", ...routes];
  const pages = [];
  for (const path of routes) pages.push(await pageSummary(path));

  const reflow = [];
  for (const desiredClientWidth of [1280, 640, 320]) {
    for (const path of reflowRoutes) {
      await call("Emulation.setDeviceMetricsOverride", { width: desiredClientWidth, height: 900, deviceScaleFactor: 1, mobile: false });
      await navigate(path);
      const scrollbarGutter = await evaluate("innerWidth - document.documentElement.clientWidth");
      if (scrollbarGutter > 0) {
        await call("Emulation.setDeviceMetricsOverride", {
          width: desiredClientWidth + scrollbarGutter,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false,
        });
        await delay(120);
      }
      reflow.push(await evaluate(`(() => ({
        path: location.pathname,
        desiredClientWidth: ${desiredClientWidth},
        viewportWidth: innerWidth,
        clientWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        overflowingElements: [...document.querySelectorAll('body *')]
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.right > document.documentElement.clientWidth + 0.5 || rect.left < -0.5)
          .slice(0, 8)
          .map(({ element, rect }) => ({
            selector: element.id ? '#' + element.id : element.tagName.toLowerCase() + (element.className && typeof element.className === 'string' ? '.' + element.className.trim().replace(/\\s+/g, '.') : ''),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          })),
      }))()`));
    }
  }
  await call("Emulation.clearDeviceMetricsOverride");

  await navigate("/dashboard");
  await call("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
  const forcedColors = await evaluate(`(() => {
    const button = document.querySelector('button');
    const link = document.querySelector('a');
    const body = document.body;
    return {
      active: matchMedia('(forced-colors: active)').matches,
      body: { color: getComputedStyle(body).color, backgroundColor: getComputedStyle(body).backgroundColor },
      button: button ? { color: getComputedStyle(button).color, backgroundColor: getComputedStyle(button).backgroundColor, borderColor: getComputedStyle(button).borderColor } : null,
      link: link ? { color: getComputedStyle(link).color, backgroundColor: getComputedStyle(link).backgroundColor } : null,
    };
  })()`);
  await call("Emulation.setEmulatedMedia", { features: [] });

  const report = {
    generatedAt: new Date().toISOString(),
    environment: { baseUrl, engine: "Chromium/Edge via CDP", cdpPort },
    keyboard: { loginTabs, loginResult, dashboardTabs, modalTrigger, modalInitialFocus, modalTabs, focusAfterEscape },
    dialogAccessibility,
    dialogAx,
    pages: [...publicPages, ...pages],
    reflow,
    forcedColors,
  };

  console.log(JSON.stringify(report, null, 2));
  cdp.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
