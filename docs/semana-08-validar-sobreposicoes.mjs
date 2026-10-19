/**
 * Validação reproduzível dos diálogos e menus de ações da Semana 8.
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
const ownerClub = {
  id: 1,
  name: "Clube Horizonte",
  description: "Leituras compartilhadas.",
  owner_id: 1,
  created_at: "2026-08-24T12:00:00Z",
  member_count: 2,
  current_user_role: "admin",
  is_member: true,
  is_favorite: true,
};
const memberClub = { ...ownerClub, owner_id: 2, current_user_role: "member" };
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

function keyParams(type, key, code, modifiers = 0) {
  const keyCode = key === "Tab" ? 9 : key === "Escape" ? 27 : 0;
  return { type, key, code, modifiers, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
}

async function main() {
  const cdp = await connect();
  const call = cdp.call;
  const failures = [];
  const results = [];
  let useMemberClub = false;

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

  async function press(key, { shift = false } = {}) {
    const code = key;
    const modifiers = shift ? 8 : 0;
    await call("Input.dispatchKeyEvent", keyParams("keyDown", key, code, modifiers));
    await call("Input.dispatchKeyEvent", keyParams("keyUp", key, code, modifiers));
    await delay(80);
  }

  async function navigate(path) {
    await call("Page.navigate", { url: `${baseUrl}${path}` });
    await delay(500);
  }

  async function clickButton(label) {
    await evaluate(`(() => {
      const label = ${JSON.stringify(label)};
      const button = [...document.querySelectorAll('button')]
        .find((candidate) => candidate.innerText.trim() === label);
      if (!button) throw new Error('Botão não encontrado: ' + label);
      button.focus();
      button.click();
    })()`);
    await delay(100);
  }

  const staticResponses = new Map([
    ["/users/me", user],
    ["/clubs", [ownerClub]],
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

  cdp.on("Fetch.requestPaused", async ({ requestId, request }) => {
    const url = new URL(request.url);
    if (url.origin !== "http://127.0.0.1:8000") {
      await call("Fetch.continueRequest", { requestId });
      return;
    }

    const isPreflight = request.method === "OPTIONS";
    const response = url.pathname === "/clubs/1"
      ? (useMemberClub ? memberClub : ownerClub)
      : staticResponses.get(url.pathname);
    const status = isPreflight ? 200 : response !== undefined ? 200 : 404;
    const body = Buffer.from(isPreflight ? "" : JSON.stringify(response ?? { detail: "Rota simulada não encontrada." })).toString("base64");
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
  await evaluate(`localStorage.setItem("lendojuntos:token", "teste-semana-8")`);
  await evaluate(`localStorage.setItem("lendojuntos:user", ${JSON.stringify(JSON.stringify(user))})`);

  async function validateMenu(path, label) {
    useMemberClub = false;
    await navigate(path);

    const closed = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')]
        .find((candidate) => candidate.innerText.trim() === ${JSON.stringify(label)});
      const panel = button && document.getElementById(button.getAttribute('aria-controls'));
      return { expanded: button?.getAttribute('aria-expanded'), panelHidden: panel?.hidden };
    })()`);
    check(closed.expanded === "false", `${label}: estado inicial não está recolhido.`);
    check(closed.panelHidden === true, `${label}: opções expostas enquanto fechado.`);

    await clickButton(label);
    const opened = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')]
        .find((candidate) => candidate.innerText.trim() === ${JSON.stringify(label)});
      const panel = button && document.getElementById(button.getAttribute('aria-controls'));
      panel?.querySelector('button')?.focus();
      return { expanded: button?.getAttribute('aria-expanded'), panelHidden: panel?.hidden };
    })()`);
    check(opened.expanded === "true", `${label}: estado expandido não foi exposto.`);
    check(opened.panelHidden === false, `${label}: opções não apareceram ao abrir.`);

    await press("Escape");
    const afterEscape = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')]
        .find((candidate) => candidate.innerText.trim() === ${JSON.stringify(label)});
      return {
        expanded: button?.getAttribute('aria-expanded'),
        focusReturned: document.activeElement === button,
      };
    })()`);
    check(afterEscape.expanded === "false", `${label}: Escape não fechou o menu.`);
    check(afterEscape.focusReturned, `${label}: Escape não devolveu o foco ao acionador.`);

    await clickButton(label);
    await evaluate("document.querySelector('h1').click()");
    await delay(80);
    const afterOutsideClick = await evaluate(`([...document.querySelectorAll('button')]
      .find((candidate) => candidate.innerText.trim() === ${JSON.stringify(label)}))?.getAttribute('aria-expanded')`);
    check(afterOutsideClick === "false", `${label}: clique externo não fechou o menu.`);

    return { label, closed, opened, afterEscape, afterOutsideClick };
  }

  async function validateDialog(testCase) {
    useMemberClub = Boolean(testCase.memberClub);
    await navigate(testCase.path);

    if (testCase.menuLabel) await clickButton(testCase.menuLabel);
    await clickButton(testCase.triggerLabel);

    const opened = await evaluate(`(() => {
      const dialog = document.querySelector('dialog[open]');
      const titleId = dialog?.getAttribute('aria-labelledby');
      const title = titleId ? document.getElementById(titleId) : null;
      const active = document.activeElement;
      const menuLabel = ${JSON.stringify(testCase.menuLabel ?? "")};
      const menuButton = [...document.querySelectorAll('button')]
        .find((candidate) => candidate.innerText.trim() === menuLabel);
      const menuPanel = menuButton && document.getElementById(menuButton.getAttribute('aria-controls'));
      return {
        exists: Boolean(dialog),
        title: title?.innerText.trim() ?? null,
        labelledBy: titleId,
        titleId: title?.id ?? null,
        ariaModal: dialog?.getAttribute('aria-modal') ?? null,
        closeButtonLabel: dialog?.querySelector('.icon-button')?.getAttribute('aria-label') ?? null,
        initialFocus: active?.closest('label')?.innerText.trim() ?? active?.innerText?.trim() ?? null,
        focusInside: Boolean(dialog?.contains(active)),
        modalPseudoClass: dialog?.matches(':modal') ?? false,
        menuExpanded: menuButton?.getAttribute('aria-expanded') ?? null,
        menuPanelHidden: menuPanel?.hidden ?? null,
      };
    })()`);
    check(opened.exists, `${testCase.title}: diálogo não abriu.`);
    check(opened.title === testCase.title, `${testCase.title}: título visível ou nome associado incorreto.`);
    check(Boolean(opened.labelledBy) && opened.labelledBy === opened.titleId, `${testCase.title}: aria-labelledby inválido.`);
    check(opened.ariaModal === "true", `${testCase.title}: estado aria-modal não foi exposto.`);
    check(opened.closeButtonLabel?.startsWith("Fechar "), `${testCase.title}: botão Fechar sem nome contextual.`);
    check(opened.focusInside, `${testCase.title}: foco inicial ficou fora do diálogo.`);
    check(opened.initialFocus?.includes(testCase.initialFocus), `${testCase.title}: foco inicial inesperado (${opened.initialFocus}).`);
    check(opened.modalPseudoClass, `${testCase.title}: diálogo não está na camada modal nativa.`);
    if (testCase.menuLabel) {
      check(opened.menuExpanded === "false" && opened.menuPanelHidden === true, `${testCase.title}: menu permaneceu aberto sob o diálogo.`);
    }

    if (!opened.exists) {
      const diagnostic = await evaluate(`(() => ({
        path: location.pathname,
        buttons: [...document.querySelectorAll('button')].map((button) => button.innerText.trim()),
        dialogs: [...document.querySelectorAll('dialog')].map((dialog) => ({ open: dialog.open, title: dialog.innerText.trim().slice(0, 80) })),
      }))()`);
      throw new Error(`${testCase.title}: diálogo não abriu. ${JSON.stringify(diagnostic)}`);
    }

    const boundaries = await evaluate(`(() => {
      const dialog = document.querySelector('dialog[open]');
      const selector = "a[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
      const items = [...dialog.querySelectorAll(selector)].filter((item) => !item.hidden && item.getAttribute('aria-hidden') !== 'true');
      items.at(-1)?.focus();
      return { count: items.length };
    })()`);
    await press("Tab");
    const forwardContained = await evaluate(`(() => {
      const dialog = document.querySelector('dialog[open]');
      return document.activeElement === dialog.querySelector(${JSON.stringify(focusableFirstSelector())});
    })()`);
    check(boundaries.count >= 3, `${testCase.title}: quantidade inesperada de controles focáveis.`);
    check(forwardContained, `${testCase.title}: Tab escapou ao avançar do último controle.`);

    await press("Tab", { shift: true });
    const backwardContained = await evaluate(`(() => {
      const dialog = document.querySelector('dialog[open]');
      const selector = "a[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
      const items = [...dialog.querySelectorAll(selector)].filter((item) => !item.hidden && item.getAttribute('aria-hidden') !== 'true');
      return document.activeElement === items.at(-1);
    })()`);
    check(backwardContained, `${testCase.title}: Shift+Tab escapou ao recuar do primeiro controle.`);

    const backgroundInert = await evaluate(`(() => {
      const dialog = document.querySelector('dialog[open]');
      const heading = document.querySelector('h1');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus();
      return dialog.contains(document.activeElement);
    })()`);
    check(backgroundInert, `${testCase.title}: conteúdo de fundo aceitou foco durante a modalidade.`);

    await press("Escape");
    const closed = await evaluate(`(() => ({
      openDialogs: document.querySelectorAll('dialog[open]').length,
      activeText: document.activeElement?.innerText?.trim() ?? document.activeElement?.getAttribute('aria-label') ?? null,
    }))()`);
    const expectedReturn = testCase.menuLabel ?? testCase.triggerLabel;
    check(closed.openDialogs === 0, `${testCase.title}: Escape não fechou o diálogo.`);
    check(closed.activeText === expectedReturn, `${testCase.title}: foco não retornou a ${expectedReturn} (${closed.activeText}).`);

    results.push({ ...testCase, opened, focusableCount: boundaries.count, forwardContained, backwardContained, backgroundInert, closed });
  }

  function focusableFirstSelector() {
    return "button:not([disabled]), a[href], input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
  }

  const menus = [
    await validateMenu("/clubs/1", "Ações do clube"),
    await validateMenu("/clubs/1/meetings/1", "Ações do encontro"),
  ];

  const dialogCases = [
    { path: "/dashboard", triggerLabel: "Criar clube", title: "Criar clube", initialFocus: "Nome do clube" },
    { path: "/clubs/1", menuLabel: "Ações do clube", triggerLabel: "✏️ Editar clube", title: "Editar clube", initialFocus: "Título" },
    { path: "/clubs/1", menuLabel: "Ações do clube", triggerLabel: "🗑️ Excluir clube", title: "Excluir clube", initialFocus: "Cancelar" },
    { path: "/clubs/1", memberClub: true, triggerLabel: "🚪 Sair do clube", title: "Sair do clube", initialFocus: "Cancelar" },
    { path: "/clubs/1/books", triggerLabel: "📚 Cadastrar livro", title: "Cadastrar livro", initialFocus: "Título" },
    { path: "/clubs/1/meetings", triggerLabel: "📍 Criar encontro", title: "Criar encontro", initialFocus: "Título" },
    { path: "/clubs/1/meetings/1", menuLabel: "Ações do encontro", triggerLabel: "✏️ Editar encontro", title: "Editar encontro", initialFocus: "Título" },
    { path: "/clubs/1/meetings/1", menuLabel: "Ações do encontro", triggerLabel: "🗑️ Apagar encontro", title: "Apagar encontro", initialFocus: "Cancelar" },
  ];

  for (const testCase of dialogCases) await validateDialog(testCase);

  useMemberClub = false;
  await navigate("/dashboard");
  await clickButton("Criar clube");
  const pointerCancellationBeforeCommit = await evaluate(`(() => {
    const dialog = document.querySelector('dialog[open]');
    const frame = dialog.querySelector('.modal-frame');
    dialog.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    const afterPress = dialog.open;
    frame.click();
    const afterInsideClick = dialog.open;
    dialog.click();
    return { afterPress, afterInsideClick };
  })()`);
  await delay(80);
  const pointerCancellation = {
    ...pointerCancellationBeforeCommit,
    afterBackdropClick: await evaluate("document.querySelectorAll('dialog[open]').length > 0"),
  };
  check(pointerCancellation.afterPress, "O pressionamento no fundo fechou o diálogo antes do clique.");
  check(pointerCancellation.afterInsideClick, "Um clique concluído dentro do diálogo fechou a sobreposição.");
  check(!pointerCancellation.afterBackdropClick, "O clique concluído no fundo não fechou o diálogo.");

  await call("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: false });
  await navigate("/clubs/1");
  await clickButton("Ações do clube");
  const narrowMenu = await evaluate(`(() => {
    const panel = document.querySelector('.action-menu-panel:not([hidden])');
    const rect = panel.getBoundingClientRect();
    return {
      viewportWidth: document.documentElement.clientWidth,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      insideViewport: rect.left >= 0 && rect.right <= document.documentElement.clientWidth + 0.5,
    };
  })()`);
  check(!narrowMenu.documentOverflow && narrowMenu.insideViewport, "O menu ultrapassou a viewport de 320 CSS px.");

  await navigate("/clubs/1/meetings");
  await clickButton("📍 Criar encontro");
  const narrowDialog = await evaluate(`(() => {
    const dialog = document.querySelector('dialog[open]');
    const frame = dialog.querySelector('.modal-frame');
    const rect = frame.getBoundingClientRect();
    return {
      viewportWidth: document.documentElement.clientWidth,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      dialogOverflow: dialog.scrollWidth > dialog.clientWidth,
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      insideViewport: rect.left >= 0 && rect.right <= document.documentElement.clientWidth + 0.5,
    };
  })()`);
  check(
    !narrowDialog.documentOverflow && !narrowDialog.dialogOverflow && narrowDialog.insideViewport,
    "O diálogo ultrapassou a viewport de 320 CSS px.",
  );
  await press("Escape");
  await call("Emulation.clearDeviceMetricsOverride");

  const report = {
    generatedAt: new Date().toISOString(),
    environment: { baseUrl, cdpPort, engine: "Chromium/Edge via CDP", api: "respostas locais simuladas" },
    result: failures.length ? "falhou" : "aprovado",
    failures,
    summary: {
      dialogs: `${results.length}/${dialogCases.length}`,
      menus: `${menus.length}/2`,
      pointerCancellation,
      reflow320: { menu: narrowMenu, dialog: narrowDialog },
    },
    menus,
    dialogs: results,
  };

  console.log(JSON.stringify(report, null, 2));
  cdp.close();
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
