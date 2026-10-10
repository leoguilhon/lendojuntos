/**
 * Validação reproduzível das fundações de acessibilidade da Semana 7.
 *
 * Pré-requisitos:
 *   1. frontend em http://127.0.0.1:5173;
 *   2. Chrome/Edge iniciado com --remote-debugging-port=9223.
 *
 * As respostas da API são simuladas pelo CDP. O roteiro não persiste dados.
 */

const cdpPort = process.env.CDP_PORT ?? "9223";
const baseUrl = process.env.LENDOJUNTOS_URL ?? "http://127.0.0.1:5173";
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const user = { id: 1, name: "Ana Leitora", email: "ana@lendojuntos.test", bio: "Leitora de ficção." };
const club = {
  id: 1,
  name: "Clube Horizonte",
  description: "Leituras compartilhadas.",
  owner_id: 1,
  created_at: "2026-08-24T12:00:00Z",
  member_count: 1,
  current_user_role: "admin",
  is_member: true,
  is_favorite: true,
};
const book = {
  id: 1,
  club_id: 1,
  title: "A hora da estrela",
  author: "Clarice Lispector",
  description: "Leitura atual do clube.",
  status: "em_leitura",
  added_by: 1,
  created_at: "2026-09-01T12:00:00Z",
  finished_at: null,
  like_count: 1,
  liked_by_current_user: true,
};
const meeting = {
  id: 1,
  club_id: 1,
  title: "Conversa de outubro",
  scheduled_for: "2026-10-20T22:00:00Z",
  location: "Sala virtual",
  agenda: "Debate dos capítulos finais.",
  book_id: 1,
  book_title: book.title,
  created_by: 1,
  created_at: "2026-10-01T12:00:00Z",
  comment_count: 0,
  attendee_count: 1,
};

const apiResponses = new Map([
  ["/users/me", user],
  ["/clubs", [club]],
  ["/clubs/1", club],
  ["/clubs/1/members", [{ user_id: 1, name: user.name, role: "admin" }]],
  ["/clubs/1/books", [book]],
  ["/clubs/1/meetings", [meeting]],
  ["/books/1", book],
  ["/books/1/comments", []],
  ["/books/1/meetings", [meeting]],
  ["/meetings/1", meeting],
  ["/meetings/1/attendees", [{ user_id: 1, name: user.name }]],
  ["/meetings/1/comments", []],
]);

async function connect() {
  const targets = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then((response) => response.json());
  const target = targets.find((item) => item.type === "page" && item.url.startsWith(baseUrl))
    ?? targets.find((item) => item.type === "page");
  if (!target) throw new Error("Nenhuma página foi encontrada no navegador com CDP.");

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

    for (const listener of listeners.get(message.method) ?? []) void listener(message.params);
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

function keyParams(type, key, code) {
  const keyCode = key === "Tab" ? 9 : key === "Enter" ? 13 : 0;
  return { type, key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
}

async function main() {
  const cdp = await connect();
  const call = cdp.call;
  const failures = [];
  let simulateClubError = false;

  function check(condition, message) {
    if (!condition) failures.push(message);
  }

  async function evaluate(expression) {
    const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      const details = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
      throw new Error(details);
    }
    return result.result.value;
  }

  async function press(key, code = key) {
    await call("Input.dispatchKeyEvent", keyParams(key === "Enter" ? "rawKeyDown" : "keyDown", key, code));
    await call("Input.dispatchKeyEvent", keyParams("keyUp", key, code));
    await delay(80);
  }

  async function navigate(path) {
    await call("Page.navigate", { url: `${baseUrl}${path}` });
    await delay(350);
  }

  cdp.on("Fetch.requestPaused", async ({ requestId, request }) => {
    const url = new URL(request.url);
    if (url.origin !== "http://127.0.0.1:8000") {
      await call("Fetch.continueRequest", { requestId });
      return;
    }

    const isPreflight = request.method === "OPTIONS";
    const simulatedFailure = simulateClubError && url.pathname === "/clubs/1";
    const response = apiResponses.get(url.pathname);
    const status = isPreflight ? 200 : simulatedFailure ? 500 : response !== undefined ? 200 : 404;
    const payload = simulatedFailure ? { detail: "Falha simulada para validar o foco." } : response;
    const body = Buffer.from(isPreflight ? "" : JSON.stringify(payload ?? { detail: "Rota simulada não encontrada." })).toString("base64");
    await call("Fetch.fulfillRequest", {
      requestId,
      responseCode: status,
      responseHeaders: [
        { name: "Content-Type", value: "application/json; charset=utf-8" },
        { name: "Access-Control-Allow-Origin", value: baseUrl },
        { name: "Access-Control-Allow-Headers", value: "Authorization, Content-Type" },
        { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
      ],
      body,
    });
  });

  await Promise.all([
    call("Page.enable"),
    call("Runtime.enable"),
    call("DOM.enable"),
    call("Fetch.enable", { patterns: [{ urlPattern: "http://127.0.0.1:8000/*" }] }),
  ]);

  await navigate("/");
  await evaluate(`localStorage.setItem("lendojuntos:token", "teste-semana-7")`);
  await evaluate(`localStorage.setItem("lendojuntos:user", ${JSON.stringify(JSON.stringify(user))})`);

  const routes = [
    ["/", "Entrar — LendoJuntos"],
    ["/register", "Criar conta — LendoJuntos"],
    ["/dashboard", "Clubes — LendoJuntos"],
    ["/clubs/1", "Clube — LendoJuntos"],
    ["/clubs/1/books", "Livros do clube — LendoJuntos"],
    ["/books/1", "Livro — LendoJuntos"],
    ["/clubs/1/meetings", "Encontros do clube — LendoJuntos"],
    ["/clubs/1/meetings/1", "Encontro — LendoJuntos"],
    ["/profile", "Perfil — LendoJuntos"],
  ];

  const pages = [];
  for (const [path, expectedTitle] of routes) {
    await navigate(path);
    const summary = await evaluate(`(() => ({
      path: location.pathname,
      title: document.title,
      mainCount: document.querySelectorAll('main').length,
      contentTargetCount: document.querySelectorAll('#conteudo-principal').length,
      h1: document.querySelector('h1')?.innerText.trim() ?? null,
      currentNavigation: [...document.querySelectorAll('nav a[aria-current="page"]')].map((item) => item.innerText.trim()),
    }))()`);
    pages.push(summary);
    check(summary.title === expectedTitle, `${path}: título inesperado (${summary.title}).`);
    check(summary.mainCount === 1, `${path}: esperava um único main.`);
    check(summary.contentTargetCount === 1, `${path}: destino principal ausente ou duplicado.`);
    check(Boolean(summary.h1), `${path}: h1 ausente após o carregamento.`);
    if (path.startsWith("/clubs/") || path.startsWith("/books/") || path === "/dashboard") {
      check(summary.currentNavigation.includes("Clubes"), `${path}: seção Clubes não marcada como atual.`);
    }
  }

  await navigate("/");
  await evaluate("document.body.focus()");
  await press("Tab");
  const skipLinkFocused = await evaluate(`(() => {
    const element = document.activeElement;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      text: element?.innerText?.trim() ?? "",
      top: Math.round(rect.top),
      outlineWidth: style.outlineWidth,
      outlineColor: style.outlineColor,
    };
  })()`);
  check(skipLinkFocused.text === "Ir para o conteúdo principal", "O link de salto não é o primeiro controle focável.");
  check(skipLinkFocused.top >= 0, "O link de salto não ficou visível ao receber foco.");
  check(skipLinkFocused.outlineWidth === "3px", "O indicador de foco não tem 3 px.");
  await press("Enter");
  const skipDestination = await evaluate("document.activeElement?.id ?? null");
  check(skipDestination === "conteudo-principal", "O link de salto não moveu o foco para o main.");

  await navigate("/dashboard");
  await evaluate(`document.querySelector('a[href="/profile"]').click()`);
  await delay(200);
  const routeFocus = await evaluate(`(() => ({
    path: location.pathname,
    tag: document.activeElement?.tagName.toLowerCase(),
    text: document.activeElement?.innerText?.trim(),
    tabIndex: document.activeElement?.getAttribute('tabindex'),
  }))()`);
  check(routeFocus.path === "/profile", "A navegação interna para Perfil falhou.");
  check(routeFocus.tag === "h1" && routeFocus.text === "Perfil", "O h1 não recebeu foco após navegação interna.");
  check(routeFocus.tabIndex === "-1", "O h1 focado não recebeu tabindex temporário.");
  await press("Tab");
  const headingTabIndexAfterBlur = await evaluate("document.querySelector('h1').getAttribute('tabindex')");
  check(headingTabIndexAfterBlur === null, "O tabindex temporário do h1 não foi removido.");
  await evaluate("history.back()");
  await delay(200);
  const backNavigationFocus = await evaluate(`(() => ({
    path: location.pathname,
    tag: document.activeElement?.tagName.toLowerCase(),
    text: document.activeElement?.innerText?.trim().slice(0, 80) ?? '',
  }))()`);
  check(backNavigationFocus.path === "/dashboard", "A navegação Voltar não retornou ao dashboard.");
  check(backNavigationFocus.tag !== "body", "A navegação Voltar deixou o foco no body.");

  simulateClubError = true;
  await evaluate("document.querySelector('.clickable-card').click()");
  await delay(2_200);
  const errorRouteFocus = await evaluate(`(() => ({
    path: location.pathname,
    tag: document.activeElement?.tagName.toLowerCase(),
    id: document.activeElement?.id ?? null,
  }))()`);
  simulateClubError = false;
  check(errorRouteFocus.path === "/clubs/1", "A rota de erro simulada não foi aberta.");
  check(
    errorRouteFocus.tag === "main" && errorRouteFocus.id === "conteudo-principal",
    "A rota sem h1 não transferiu o foco para o main.",
  );

  const reflow = [];
  for (const width of [1280, 640, 320]) {
    await call("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const [path] of routes) {
      await navigate(path);
      const result = await evaluate(`(() => ({
        path: location.pathname,
        width: ${width},
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflowingElements: [...document.querySelectorAll('body *')]
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.right > document.documentElement.clientWidth + 0.5 || rect.left < -0.5)
          .slice(0, 8)
          .map(({ element, rect }) => ({
            selector: element.id
              ? '#' + element.id
              : element.tagName.toLowerCase() + (typeof element.className === 'string' && element.className.trim()
                ? '.' + element.className.trim().replace(/\\s+/g, '.')
                : ''),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          })),
      }))()`);
      result.overflow = result.scrollWidth > result.clientWidth;
      reflow.push(result);
      check(!result.overflow, `${path}: overflow horizontal em ${width} CSS px.`);
    }
  }
  await call("Emulation.clearDeviceMetricsOverride");

  await navigate("/dashboard");
  await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const reducedMotion = await evaluate(`(() => {
    const heading = document.querySelector('.page-heading');
    const link = document.querySelector('a');
    return {
      active: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationName: getComputedStyle(heading).animationName,
      transitionDuration: getComputedStyle(link).transitionDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  })()`);
  check(reducedMotion.active, "A preferência por movimento reduzido não foi emulada.");
  check(reducedMotion.animationName === "none", "Animação permaneceu ativa com movimento reduzido.");
  check(reducedMotion.transitionDuration === "0s", "Transição permaneceu ativa com movimento reduzido.");
  check(reducedMotion.scrollBehavior === "auto", "Rolagem suave permaneceu ativa com movimento reduzido.");

  await call("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
  await evaluate(`document.querySelector('a[href="/profile"]').focus()`);
  const forcedColors = await evaluate(`(() => {
    const element = document.activeElement;
    const style = getComputedStyle(element);
    return {
      active: matchMedia('(forced-colors: active)').matches,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  })()`);
  check(forcedColors.active, "O modo de cores forçadas não foi emulado.");
  check(forcedColors.outlineStyle !== "none" && forcedColors.outlineWidth === "3px", "Foco não preservado em cores forçadas.");
  check(forcedColors.boxShadow === "none", "A sombra de foco não foi removida em cores forçadas.");
  await call("Emulation.setEmulatedMedia", { features: [] });

  const report = {
    generatedAt: new Date().toISOString(),
    environment: { baseUrl, cdpPort, engine: "Chromium/Edge via CDP", api: "respostas locais simuladas" },
    result: failures.length ? "falhou" : "aprovado",
    failures,
    pages,
    skipLink: { focused: skipLinkFocused, destination: skipDestination },
    routeFocus: {
      onNavigation: routeFocus,
      tabIndexAfterBlur: headingTabIndexAfterBlur,
      afterBack: backNavigationFocus,
      errorFallback: errorRouteFocus,
    },
    reducedMotion,
    forcedColors,
    reflow,
  };

  console.log(JSON.stringify(report, null, 2));
  cdp.close();
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
