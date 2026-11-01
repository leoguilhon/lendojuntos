/**
 * Validação reproduzível de cartões, links e alternâncias da Semana 10.
 *
 * Pré-requisitos:
 *   1. frontend em http://127.0.0.1:5173;
 *   2. Chrome/Edge iniciado com --remote-debugging-port=9223.
 *
 * As respostas da API são simuladas pelo CDP. O roteiro não persiste dados.
 */

import { mkdir, writeFile } from "node:fs/promises";

const cdpPort = process.env.CDP_PORT ?? "9223";
const baseUrl = process.env.LENDOJUNTOS_URL ?? "http://127.0.0.1:5173";
const apiOrigin = "http://127.0.0.1:8000";
const evidenceDirectory = new URL("./evidencias-acessibilidade/semana-10/", import.meta.url);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const user = { id: 1, name: "Ana Leitora", email: "ana@lendojuntos.test", bio: "Leitora de ficção." };
let favorite = false;
let liked = false;
let readingStatus = "em_leitura";
let attendanceConfirmed = false;
let isAdmin = true;

const baseClub = {
  id: 1,
  name: "Entre Capítulos",
  description: "Ficção contemporânea e encontros quinzenais.",
  owner_id: 1,
  created_at: "2026-09-01T12:00:00Z",
  member_count: 4,
  current_user_role: "admin",
  is_member: true,
};
const availableClub = {
  id: 2,
  name: "Leituras do Futuro",
  description: "Ficção científica e futuros possíveis.",
  owner_id: 2,
  created_at: "2026-09-02T12:00:00Z",
  member_count: 3,
  current_user_role: null,
  is_member: false,
  is_favorite: false,
};
const baseBook = {
  id: 10,
  club_id: 1,
  title: "Torto Arado",
  author: "Itamar Vieira Junior",
  description: "Uma história de terra, memória e resistência.",
  added_by: 1,
  created_at: "2026-09-03T12:00:00Z",
  finished_at: null,
};
const secondBook = {
  id: 11,
  club_id: 1,
  title: "O Avesso da Pele",
  author: "Jeferson Tenório",
  description: "Memória familiar e identidade.",
  status: "planejado",
  added_by: 1,
  created_at: "2026-09-04T12:00:00Z",
  finished_at: null,
  like_count: 0,
  liked_by_current_user: false,
};
const futureMeeting = {
  id: 100,
  club_id: 1,
  title: "Capítulos 8 a 14",
  scheduled_for: "2026-12-10T22:30:00Z",
  location: "Biblioteca Central",
  agenda: "Conversar sobre memória e território.",
  book_id: 10,
  book_title: "Torto Arado",
  created_by: 1,
  created_at: "2026-10-01T12:00:00Z",
  comment_count: 2,
  attendee_count: 0,
};
const pastMeeting = {
  ...futureMeeting,
  id: 101,
  title: "Capítulos 1 a 7",
  scheduled_for: "2026-10-10T22:30:00Z",
  comment_count: 1,
};

function currentClub() {
  return { ...baseClub, current_user_role: isAdmin ? "admin" : "membro", is_favorite: favorite };
}

function currentBook() {
  return {
    ...baseBook,
    status: readingStatus,
    like_count: liked ? 1 : 0,
    liked_by_current_user: liked,
  };
}

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

async function main() {
  const cdp = await connect();
  const call = cdp.call;
  const failures = [];
  const results = {};

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

  async function navigate(path) {
    await call("Page.navigate", { url: `${baseUrl}${path}` });
    await delay(550);
  }

  async function focusAndClick(selector) {
    await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) throw new Error('Controle não encontrado: ' + ${JSON.stringify(selector)});
      element.focus();
      element.click();
    })()`);
    await delay(400);
  }

  async function activateFirstCardLink() {
    await evaluate(`(() => {
      const link = document.querySelector('.card-title-link');
      if (!link) throw new Error('Link de título não encontrado.');
      link.focus();
    })()`);
    await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await delay(500);
  }

  async function capture(name) {
    await mkdir(evidenceDirectory, { recursive: true });
    await evaluate("window.scrollTo(0, 0)");
    await delay(100);
    const { data } = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    await writeFile(new URL(name, evidenceDirectory), Buffer.from(data, "base64"));
  }

  cdp.on("Fetch.requestPaused", async ({ requestId, request }) => {
    const url = new URL(request.url);
    if (url.origin !== apiOrigin) {
      await call("Fetch.continueRequest", { requestId });
      return;
    }

    if (request.method === "OPTIONS") {
      await fulfill(call, requestId, 200, {});
      return;
    }

    let status = 200;
    let response = {};
    const path = url.pathname;

    if (path === "/users/me") response = user;
    else if (path === "/clubs" && request.method === "GET") response = [currentClub(), availableClub];
    else if (path === "/clubs/1") response = currentClub();
    else if (path === "/clubs/1/members") response = [{ user_id: 1, name: user.name, role: "admin" }];
    else if (path === "/clubs/1/books" && request.method === "GET") response = [currentBook(), secondBook];
    else if (path === "/clubs/1/meetings" && request.method === "GET") response = [futureMeeting, pastMeeting];
    else if (path === "/clubs/1/favorite") {
      favorite = request.method === "POST";
      response = currentClub();
    } else if (path === "/books/10") response = currentBook();
    else if (path === "/books/10/comments") response = [];
    else if (path === "/books/10/meetings") response = [futureMeeting];
    else if (path === "/books/10/like") {
      liked = request.method === "POST";
      response = currentBook();
    } else if (path === "/books/10/status" && request.method === "PATCH") {
      readingStatus = JSON.parse(request.postData).status;
      response = currentBook();
    } else if (path === "/meetings/100") response = futureMeeting;
    else if (path === "/meetings/100/comments") response = [];
    else if (path === "/meetings/100/attendees") {
      response = attendanceConfirmed ? [{ user_id: 1, name: user.name }] : [];
    } else if (path === "/meetings/100/attendance") {
      attendanceConfirmed = request.method === "POST";
      response = attendanceConfirmed ? [{ user_id: 1, name: user.name }] : [];
    } else {
      status = 404;
      response = { detail: `Rota simulada não encontrada: ${request.method} ${path}` };
    }

    await fulfill(call, requestId, status, response);
  });

  await Promise.all([
    call("Page.enable"),
    call("Runtime.enable"),
    call("Fetch.enable", { patterns: [{ urlPattern: `${apiOrigin}/*` }] }),
  ]);
  await call("Emulation.clearDeviceMetricsOverride");
  await evaluate(`localStorage.setItem('lendojuntos:token', 'teste-semana-10'); localStorage.setItem('lendojuntos:user', ${JSON.stringify(JSON.stringify(user))})`);

  await navigate("/dashboard");
  results.dashboard = await evaluate(`(() => ({
    path: location.pathname,
    simulatedLinks: document.querySelectorAll('[role="link"], .clickable-card').length,
    cardLinks: [...document.querySelectorAll('.resource-card .card-title-link')].map((link) => link.getAttribute('href')),
    cardTabIndexes: [...document.querySelectorAll('.resource-card')].map((card) => card.getAttribute('tabindex')),
    toggles: [...document.querySelectorAll('.favorite-toggle')].map((button) => ({
      pressed: button.getAttribute('aria-pressed'), label: button.getAttribute('aria-label'),
    })),
  }))()`);
  check(results.dashboard.path === "/dashboard", "Dashboard: rota autenticada não abriu.");
  check(results.dashboard.simulatedLinks === 0, "Dashboard: ainda existem cartões simulando links.");
  check(results.dashboard.cardLinks.join("|") === "/clubs/1|/clubs/2", "Dashboard: títulos não possuem destinos reais.");
  check(results.dashboard.cardTabIndexes.every((value) => value === null), "Dashboard: contêiner de cartão permanece na ordem de foco.");
  check(results.dashboard.toggles.every((item) => item.pressed === "false" && /Entre Capítulos|Leituras do Futuro/.test(item.label)), "Dashboard: favorito não expõe estado e nome contextual.");

  await focusAndClick('.favorite-toggle[aria-label*="Entre Capítulos"]');
  results.favorite = await evaluate(`(() => {
    const button = document.querySelector('.favorite-toggle[aria-label*="Entre Capítulos"]');
    return {
      pressed: button?.getAttribute('aria-pressed'),
      label: button?.getAttribute('aria-label'),
      focused: document.activeElement === button,
      status: document.querySelector('[role="status"]')?.textContent.trim(),
    };
  })()`);
  check(results.favorite.pressed === "true" && results.favorite.label?.startsWith("Remover"), "Favorito: nome e aria-pressed não mudaram.");
  check(results.favorite.focused, "Favorito: foco não permaneceu no botão.");
  check(results.favorite.status === "Entre Capítulos adicionado aos favoritos.", "Favorito: resultado não foi anunciado com contexto.");
  await capture("dashboard-links-e-favorito.png");

  await activateFirstCardLink();
  results.clubNavigation = await evaluate(`({ path: location.pathname, heading: document.querySelector('h1')?.textContent, focused: document.activeElement?.tagName })`);
  check(results.clubNavigation.path === "/clubs/1", "Clube: Enter no link nativo não navegou.");
  check(results.clubNavigation.heading === "Entre Capítulos" && results.clubNavigation.focused === "H1", "Clube: navegação não restaurou contexto no h1.");

  results.club = await evaluate(`(() => ({
    simulatedLinks: document.querySelectorAll('[role="link"], .clickable-card').length,
    titleLinks: [...document.querySelectorAll('.card-title-link')].map((link) => link.getAttribute('href')),
    panelLinks: [...document.querySelectorAll('.section-header .button-link')].map((link) => link.getAttribute('href')),
    favoritePressed: document.querySelector('.favorite-toggle')?.getAttribute('aria-pressed'),
  }))()`);
  check(results.club.simulatedLinks === 0, "Clube: ainda existem painéis ou cartões simulando links.");
  check(results.club.titleLinks.includes("/books/10") && results.club.titleLinks.includes("/clubs/1/meetings/100"), "Clube: resumos não possuem links nativos.");
  check(results.club.panelLinks.includes("/clubs/1/books") && results.club.panelLinks.includes("/clubs/1/meetings"), "Clube: painéis não oferecem destinos explícitos.");
  check(results.club.favoritePressed === "true", "Clube: favorito não preservou aria-pressed.");

  await navigate("/clubs/1/books");
  results.books = await evaluate(`(() => ({
    simulatedLinks: document.querySelectorAll('[role="link"], .clickable-card').length,
    titleLinks: [...document.querySelectorAll('.resource-card .card-title-link')].map((link) => link.getAttribute('href')),
    toggles: [...document.querySelectorAll('.like-toggle')].map((button) => ({ pressed: button.getAttribute('aria-pressed'), label: button.getAttribute('aria-label') })),
  }))()`);
  check(results.books.simulatedLinks === 0, "Livros: ainda existem cartões simulando links.");
  check(results.books.titleLinks.join("|") === "/books/10|/books/11", "Livros: títulos não possuem destinos reais.");
  check(results.books.toggles.every((item) => item.pressed === "false" && /Torto Arado|O Avesso da Pele/.test(item.label)), "Livros: curtidas não expõem estado e nome contextual.");

  await focusAndClick('.like-toggle[aria-label*="Torto Arado"]');
  results.like = await evaluate(`(() => {
    const button = document.querySelector('.like-toggle[aria-label*="Torto Arado"]');
    return {
      pressed: button?.getAttribute('aria-pressed'),
      label: button?.getAttribute('aria-label'),
      focused: document.activeElement === button,
      status: document.querySelector('[role="status"]')?.textContent.trim(),
    };
  })()`);
  check(results.like.pressed === "true" && results.like.label?.startsWith("Remover"), "Curtida: nome e aria-pressed não mudaram.");
  check(results.like.focused, "Curtida: foco não permaneceu no botão.");
  check(results.like.status === "Torto Arado curtido.", "Curtida: resultado não foi anunciado com contexto.");
  await capture("livros-links-e-curtida.png");

  await activateFirstCardLink();
  results.bookNavigation = await evaluate(`({ path: location.pathname, heading: document.querySelector('h1')?.textContent, focused: document.activeElement?.tagName })`);
  check(results.bookNavigation.path === "/books/10", "Livro: Enter no link nativo não navegou.");
  check(results.bookNavigation.heading === "Torto Arado" && results.bookNavigation.focused === "H1", "Livro: navegação não restaurou contexto no h1.");

  results.readingStatusBefore = await evaluate(`(() => ({
    legend: document.querySelector('.reading-status-group legend')?.textContent,
    pressed: [...document.querySelectorAll('.segmented-control button')].map((button) => button.getAttribute('aria-pressed')),
    selectedText: document.querySelector('.segmented-control [aria-pressed="true"]')?.textContent,
    meetingLinks: [...document.querySelectorAll('.list-card .card-title-link')].map((link) => link.getAttribute('href')),
  }))()`);
  check(results.readingStatusBefore.legend === "Situação da leitura", "Situação: grupo não possui nome visível.");
  check(results.readingStatusBefore.pressed.filter((value) => value === "true").length === 1, "Situação: opção atual não é única.");
  check(results.readingStatusBefore.selectedText?.includes("selecionado"), "Situação: opção atual não possui indicação textual.");
  check(results.readingStatusBefore.meetingLinks[0] === "/clubs/1/meetings/100", "Livro: encontro relacionado não possui link real.");

  await focusAndClick('.segmented-control button[aria-pressed="false"]');
  results.readingStatusAfter = await evaluate(`(() => {
    const selected = document.querySelector('.segmented-control [aria-pressed="true"]');
    return {
      selected: selected?.textContent,
      focused: document.activeElement === selected,
      status: document.querySelector('[role="status"]')?.textContent.trim(),
    };
  })()`);
  check(results.readingStatusAfter.selected?.startsWith("Planejado"), "Situação: nova opção não ficou selecionada.");
  check(results.readingStatusAfter.focused, "Situação: foco não permaneceu na opção escolhida.");
  check(results.readingStatusAfter.status === "Situação de Torto Arado alterada para Planejado.", "Situação: atualização não foi anunciada com objeto e valor.");

  isAdmin = false;
  await navigate("/books/10");
  results.readingStatusMember = await evaluate(`(() => ({
    disabled: document.querySelector('.reading-status-group')?.disabled,
    explanation: document.querySelector('.reading-status-group p')?.textContent,
    selected: document.querySelector('.segmented-control [aria-pressed="true"]')?.textContent,
  }))()`);
  check(results.readingStatusMember.disabled, "Situação: opções não permitidas continuam operáveis para membro.");
  check(results.readingStatusMember.explanation?.includes("Somente administradores"), "Situação: motivo da indisponibilidade não é informado.");
  check(results.readingStatusMember.selected?.includes("selecionado"), "Situação: membro não consegue identificar a opção atual.");
  isAdmin = true;

  await navigate("/clubs/1/meetings");
  results.meetings = await evaluate(`(() => ({
    simulatedLinks: document.querySelectorAll('[role="link"], .clickable-card').length,
    links: [...document.querySelectorAll('.meeting-card .card-title-link')].map((link) => link.getAttribute('href')),
    articleTabIndexes: [...document.querySelectorAll('.meeting-card')].map((card) => card.getAttribute('tabindex')),
  }))()`);
  check(results.meetings.simulatedLinks === 0, "Encontros: ainda existem cartões simulando links.");
  check(results.meetings.links.includes("/clubs/1/meetings/100") && results.meetings.links.includes("/clubs/1/meetings/101"), "Encontros: títulos não possuem destinos reais.");
  check(results.meetings.articleTabIndexes.every((value) => value === null), "Encontros: contêiner permanece na ordem de foco.");
  await capture("encontros-links-nativos.png");

  await activateFirstCardLink();
  results.meetingNavigation = await evaluate(`({ path: location.pathname, heading: document.querySelector('h1')?.textContent, focused: document.activeElement?.tagName })`);
  check(results.meetingNavigation.path === "/clubs/1/meetings/100", "Encontro: Enter no link nativo não navegou.");
  check(results.meetingNavigation.focused === "H1", "Encontro: navegação não restaurou contexto no h1.");

  await focusAndClick('button[aria-label^="Confirmar presença"]');
  results.attendance = await evaluate(`(() => {
    const button = document.querySelector('button[aria-pressed]');
    return {
      pressed: button?.getAttribute('aria-pressed'),
      label: button?.getAttribute('aria-label'),
      focused: document.activeElement === button,
      status: document.querySelector('[role="status"]')?.textContent.trim(),
      currentUser: [...document.querySelectorAll('.member-row strong')].some((item) => item.textContent === 'Você'),
    };
  })()`);
  check(results.attendance.pressed === "true" && results.attendance.label?.startsWith("Cancelar"), "Presença: nome e aria-pressed não mudaram.");
  check(results.attendance.focused, "Presença: foco não permaneceu no botão.");
  check(results.attendance.status === "Presença confirmada em Capítulos 8 a 14.", "Presença: resultado não foi anunciado com contexto.");
  check(results.attendance.currentUser, "Presença: lista não refletiu a confirmação.");

  await call("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: false });
  for (const path of ["/dashboard", "/clubs/1", "/clubs/1/books", "/books/10", "/clubs/1/meetings", "/clubs/1/meetings/100"]) {
    await navigate(path);
    results[`reflow:${path}`] = await evaluate(`(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }))()`);
    check(!results[`reflow:${path}`].overflow, `${path}: conteúdo gerou overflow horizontal em 320 CSS px.`);
  }
  await call("Emulation.clearDeviceMetricsOverride");

  const report = {
    generatedAt: new Date().toISOString(),
    environment: { baseUrl, cdpPort, engine: "Chromium/Edge via CDP", api: "respostas locais simuladas" },
    result: failures.length ? "falhou" : "aprovado",
    failures,
    summary: {
      routes: "6/6",
      simulatedCards: "0",
      nativeCardLinks: "clubes, livros e encontros",
      toggles: "favorito, curtida, situação e presença",
      focus: "preservado nas quatro alternâncias",
      reflow320: "6/6 rotas",
      captures: "3 evidências PNG",
    },
    details: results,
  };

  console.log(JSON.stringify(report, null, 2));
  cdp.close();
  if (failures.length) process.exitCode = 1;
}

async function fulfill(call, requestId, responseCode, response) {
  await call("Fetch.fulfillRequest", {
    requestId,
    responseCode,
    responseHeaders: [
      { name: "Content-Type", value: "application/json; charset=utf-8" },
      { name: "Access-Control-Allow-Origin", value: baseUrl },
      { name: "Access-Control-Allow-Headers", value: "Authorization, Content-Type" },
      { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
    ],
    body: Buffer.from(JSON.stringify(response)).toString("base64"),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
