/**
 * Validação reproduzível dos formulários de autenticação e perfil da Semana 9.
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
const evidenceDirectory = new URL("./evidencias-acessibilidade/semana-09/", import.meta.url);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const user = { id: 1, name: "Ana Leitora", email: "ana@lendojuntos.test", bio: "Leitora de ficção." };
let loginShouldFail = true;
let registerShouldConflict = true;
let profileUpdates = 0;

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
    await delay(450);
  }

  async function fill(selector, value) {
    await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) throw new Error('Campo não encontrado: ' + ${JSON.stringify(selector)});
      const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await delay(40);
  }

  async function clickButton(label) {
    await evaluate(`(() => {
      const label = ${JSON.stringify(label)};
      const button = [...document.querySelectorAll('button')].find((item) => item.innerText.trim() === label);
      if (!button) throw new Error('Botão não encontrado: ' + label);
      button.click();
    })()`);
    await delay(40);
  }

  async function capture(name) {
    await mkdir(evidenceDirectory, { recursive: true });
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
      await call("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        responseHeaders: corsHeaders(),
        body: "",
      });
      return;
    }

    await delay(250);
    let status = 200;
    let response = user;
    if (url.pathname === "/auth/login") {
      status = loginShouldFail ? 401 : 200;
      response = loginShouldFail ? { detail: "E-mail ou senha inválidos." } : authResponse(user);
    } else if (url.pathname === "/auth/register") {
      status = registerShouldConflict ? 409 : 201;
      response = registerShouldConflict ? { detail: "E-mail já cadastrado." } : authResponse(user);
    } else if (url.pathname === "/users/me" && request.method === "PUT") {
      profileUpdates += 1;
      response = { ...user, name: "Ana Atualizada", bio: "Bio revisada" };
    } else if (url.pathname !== "/users/me") {
      status = 404;
      response = { detail: "Rota simulada não encontrada." };
    }

    await call("Fetch.fulfillRequest", {
      requestId,
      responseCode: status,
      responseHeaders: corsHeaders(),
      body: Buffer.from(JSON.stringify(response)).toString("base64"),
    });
  });

  await Promise.all([
    call("Page.enable"),
    call("Runtime.enable"),
    call("Fetch.enable", { patterns: [{ urlPattern: `${apiOrigin}/*` }] }),
  ]);
  await call("Emulation.clearDeviceMetricsOverride");
  await call("Emulation.setEmulatedMedia", { media: "", features: [] });

  await navigate("/register");
  await clickButton("Criar conta");
  results.registerClientValidation = await evaluate(`(() => ({
    autocomplete: [...document.querySelectorAll('input')].map((input) => [input.id, input.autocomplete]),
    errors: [...document.querySelectorAll('.field-error')].map((item) => item.id),
    invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map((item) => item.id),
    descriptionsValid: [...document.querySelectorAll('[aria-invalid="true"]')].every((item) =>
      item.getAttribute('aria-describedby')?.split(/\\s+/).every((id) => document.getElementById(id))),
    activeId: document.activeElement?.id,
  }))()`);
  check(JSON.stringify(results.registerClientValidation.autocomplete) === JSON.stringify([
    ["register-name", "name"], ["register-email", "email"], ["register-password", "new-password"],
  ]), "Cadastro: tokens autocomplete incorretos.");
  check(results.registerClientValidation.errors.length === 3, "Cadastro: envio vazio não gerou três erros de campo.");
  check(results.registerClientValidation.invalid.length === 3, "Cadastro: campos inválidos não expõem aria-invalid.");
  check(results.registerClientValidation.descriptionsValid, "Cadastro: erro não associado por aria-describedby.");
  check(results.registerClientValidation.activeId === "register-name", "Cadastro: foco não foi ao primeiro campo inválido.");
  await delay(180);
  await capture("cadastro-erros-associados.png");

  await fill("#register-name", "Ana Teste");
  await fill("#register-email", "ana@lendojuntos.test");
  await fill("#register-password", "123456");
  await clickButton("Criar conta");
  results.registerBusy = await evaluate(`(() => ({
    busy: document.querySelector('form')?.getAttribute('aria-busy'),
    status: document.querySelector('[role="status"]')?.textContent.trim(),
  }))()`);
  check(results.registerBusy.busy === "true", "Cadastro: formulário não expôs estado ocupado.");
  check(results.registerBusy.status === "Criando sua conta. Aguarde.", "Cadastro: estado de envio não foi anunciado.");
  await delay(350);
  results.registerServerError = await evaluate(`(() => ({
    error: document.getElementById('register-email-error')?.textContent,
    invalid: document.getElementById('register-email')?.getAttribute('aria-invalid'),
    describedBy: document.getElementById('register-email')?.getAttribute('aria-describedby'),
    activeId: document.activeElement?.id,
    values: [...document.querySelectorAll('input')].map((input) => input.value),
  }))()`);
  check(results.registerServerError.error?.includes("já está cadastrado"), "Cadastro: conflito da API não foi convertido em erro corrigível no e-mail.");
  check(results.registerServerError.invalid === "true" && results.registerServerError.describedBy === "register-email-error", "Cadastro: erro da API não ficou associado ao e-mail.");
  check(results.registerServerError.activeId === "register-email", "Cadastro: foco não foi ao e-mail após conflito.");
  check(results.registerServerError.values.join("|") === "Ana Teste|ana@lendojuntos.test|123456", "Cadastro: dados válidos foram apagados após erro.");

  await navigate("/");
  results.loginAutocomplete = await evaluate(`([...document.querySelectorAll('input')].map((input) => [input.id, input.autocomplete]))`);
  check(JSON.stringify(results.loginAutocomplete) === JSON.stringify([
    ["login-email", "email"], ["login-password", "current-password"],
  ]), "Login: tokens autocomplete incorretos.");
  await fill("#login-email", "ana@lendojuntos.test");
  await fill("#login-password", "senha-errada");
  await clickButton("Entrar na plataforma");
  results.loginBusy = await evaluate(`(() => ({
    busy: document.querySelector('form')?.getAttribute('aria-busy'),
    status: document.querySelector('[role="status"]')?.textContent.trim(),
  }))()`);
  check(results.loginBusy.busy === "true", "Login: formulário não expôs estado ocupado.");
  check(results.loginBusy.status === "Verificando seus dados. Aguarde.", "Login: estado de envio não foi anunciado.");
  await delay(350);
  results.loginError = await evaluate(`(() => ({
    alert: document.querySelector('[role="alert"]')?.textContent,
    invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map((item) => item.id),
    descriptionsValid: [...document.querySelectorAll('[aria-invalid="true"]')].every((item) =>
      item.getAttribute('aria-describedby')?.split(/\\s+/).every((id) => document.getElementById(id))),
    activeId: document.activeElement?.id,
  }))()`);
  check(results.loginError.alert?.includes("inválidos"), "Login: falha da API não foi exposta como alerta.");
  check(results.loginError.invalid.length === 2 && results.loginError.descriptionsValid, "Login: falha não foi associada aos dois campos.");
  check(results.loginError.activeId === "login-email", "Login: foco não foi ao primeiro campo que requer correção.");
  await delay(180);
  await capture("login-erro-servidor.png");

  await evaluate(`localStorage.setItem('lendojuntos:token', 'teste-semana-9'); localStorage.setItem('lendojuntos:user', ${JSON.stringify(JSON.stringify(user))})`);
  await navigate("/profile");
  await fill("#profile-name", "Ana Atualizada");
  await fill("#profile-bio", "Bio revisada");
  await clickButton("Revisar alterações");
  results.profileReview = await evaluate(`(() => ({
    updateCount: ${profileUpdates},
    heading: document.getElementById('profile-review-title')?.textContent,
    headingFocused: document.activeElement?.id === 'profile-review-title',
    values: [...document.querySelectorAll('.review-list dd')].map((item) => item.textContent),
  }))()`);
  check(profileUpdates === 0, "Perfil: dados foram persistidos antes da confirmação.");
  check(results.profileReview.heading === "Revise seu perfil" && results.profileReview.headingFocused, "Perfil: etapa de revisão não recebeu foco contextual.");
  check(results.profileReview.values.join("|") === "Ana Atualizada|Bio revisada", "Perfil: revisão não mostra os dados editados.");
  await delay(180);
  await capture("perfil-revisao.png");

  await clickButton("Voltar e corrigir");
  await delay(60);
  results.profileBack = await evaluate(`(() => ({
    activeId: document.activeElement?.id,
    name: document.getElementById('profile-name')?.value,
    bio: document.getElementById('profile-bio')?.value,
    autocomplete: document.getElementById('profile-name')?.autocomplete,
  }))()`);
  check(results.profileBack.activeId === "profile-name", "Perfil: voltar da revisão não devolveu foco à edição.");
  check(results.profileBack.name === "Ana Atualizada" && results.profileBack.bio === "Bio revisada", "Perfil: voltar da revisão apagou dados.");
  check(results.profileBack.autocomplete === "name", "Perfil: autocomplete do nome está incorreto.");

  await clickButton("Revisar alterações");
  await clickButton("Confirmar alterações");
  results.profileBusy = await evaluate(`(() => ({
    busy: document.querySelector('.review-panel')?.getAttribute('aria-busy'),
    status: document.querySelector('.review-panel [role="status"]')?.textContent.trim(),
  }))()`);
  check(results.profileBusy.busy === "true", "Perfil: revisão não expôs estado ocupado.");
  check(results.profileBusy.status === "Salvando as alterações do perfil. Aguarde.", "Perfil: salvamento não foi anunciado.");
  await delay(350);
  results.profileSuccess = await evaluate(`(() => ({
    updateCount: ${profileUpdates},
    status: document.querySelector('main > [role="status"]')?.textContent,
    editingRestored: Boolean(document.getElementById('profile-name')),
  }))()`);
  check(profileUpdates === 1, "Perfil: confirmação não realizou exatamente uma atualização.");
  check(results.profileSuccess.status === "Perfil atualizado.", "Perfil: sucesso não foi anunciado.");
  check(results.profileSuccess.editingRestored, "Perfil: formulário não retornou após o salvamento.");

  await call("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: false });
  for (const path of ["/", "/register", "/profile"]) {
    if (path === "/profile") {
      await evaluate(`localStorage.setItem('lendojuntos:token', 'teste-semana-9'); localStorage.setItem('lendojuntos:user', ${JSON.stringify(JSON.stringify(user))})`);
    }
    await navigate(path);
    results[`reflow:${path}`] = await evaluate(`(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }))()`);
    check(!results[`reflow:${path}`].overflow, `${path}: formulário gerou overflow horizontal em 320 CSS px.`);
  }
  await call("Emulation.clearDeviceMetricsOverride");

  const report = {
    generatedAt: new Date().toISOString(),
    environment: { baseUrl, cdpPort, engine: "Chromium/Edge via CDP", api: "respostas locais simuladas" },
    result: failures.length ? "falhou" : "aprovado",
    failures,
    summary: {
      forms: "3/3",
      autocomplete: "6/6 campos aplicáveis",
      clientErrors: "associados e com foco no primeiro campo",
      serverErrors: "login e e-mail já cadastrado",
      profilePrevention: `${profileUpdates}/1 atualização após confirmação`,
      reflow320: "3/3 rotas",
      captures: "3 evidências PNG",
    },
    details: results,
  };

  console.log(JSON.stringify(report, null, 2));
  cdp.close();
  if (failures.length) process.exitCode = 1;
}

function corsHeaders() {
  return [
    { name: "Content-Type", value: "application/json; charset=utf-8" },
    { name: "Access-Control-Allow-Origin", value: baseUrl },
    { name: "Access-Control-Allow-Headers", value: "Authorization, Content-Type" },
    { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
  ];
}

function authResponse(responseUser) {
  return { access_token: "teste-semana-9", token_type: "bearer", user: responseUser };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
