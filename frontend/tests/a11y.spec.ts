import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page, TestInfo } from "@playwright/test";

const user = { id: 1, name: "Ana Leitora", email: "ana@lendojuntos.test", bio: "Leitora de ficção." };
const club = {
  id: 1,
  name: "Entre Capítulos",
  description: "Ficção contemporânea e encontros quinzenais.",
  owner_id: 1,
  created_at: "2026-09-01T12:00:00Z",
  member_count: 4,
  current_user_role: "admin",
  is_member: true,
  is_favorite: false,
};
const book = {
  id: 10,
  club_id: 1,
  title: "Torto Arado",
  author: "Itamar Vieira Junior",
  description: "Uma história de terra, memória e resistência.",
  status: "em_leitura",
  added_by: 1,
  created_at: "2026-09-03T12:00:00Z",
  finished_at: null,
  like_count: 0,
  liked_by_current_user: false,
};
const meeting = {
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
  comment_count: 0,
  attendee_count: 0,
};

async function mockApi(page: Page) {
  await page.addInitScript(({ storedUser }) => {
    localStorage.setItem("lendojuntos:token", "teste-semana-11");
    localStorage.setItem("lendojuntos:user", JSON.stringify(storedUser));
  }, { storedUser: user });

  await page.route("http://127.0.0.1:8000/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    let body: unknown;
    let status = 200;

    if (method === "OPTIONS") body = {};
    else if (path === "/users/me") body = user;
    else if (path === "/clubs" && method === "GET") body = [club];
    else if (path === "/clubs" && method === "POST") body = club;
    else if (path === "/clubs/1") body = club;
    else if (path === "/clubs/1/members") body = [{ user_id: 1, name: user.name, role: "admin" }];
    else if (path === "/clubs/1/books" && method === "GET") body = [book];
    else if (path === "/clubs/1/books" && method === "POST") body = book;
    else if (path === "/clubs/1/meetings" && method === "GET") body = [meeting];
    else if (path === "/clubs/1/meetings" && method === "POST") body = meeting;
    else if (path === "/books/10") body = book;
    else if (path === "/books/10/comments" && method === "GET") body = [];
    else if (path === "/books/10/comments" && method === "POST") body = {
      id: 1, club_id: 1, user_id: 1, user_name: user.name, content: "Comentário de teste", created_at: "2026-11-08T12:00:00Z", book_id: 10, meeting_id: null,
    };
    else if (path === "/books/10/meetings") body = [meeting];
    else if (path === "/meetings/100") body = meeting;
    else if (path === "/meetings/100/comments") body = [];
    else if (path === "/meetings/100/attendees") body = [];
    else {
      status = 404;
      body = { detail: `Rota simulada não encontrada: ${method} ${path}` };
    }

    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
}

async function scan(page: Page, testInfo: TestInfo, state: string) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  await testInfo.attach(`axe-${state}`, {
    body: JSON.stringify({
      url: result.url,
      violations: result.violations,
      incomplete: result.incomplete,
    }, null, 2),
    contentType: "application/json",
  });

  const incompleteRules = result.incomplete.map((item) => item.id).join(", ") || "nenhum";
  console.log(`${state}: ${result.violations.length} violação(ões); revisão manual: ${incompleteRules}.`);

  expect(result.violations, `${state}: violações automáticas do axe`).toEqual([]);
}

test("T01 e T02 — autenticação", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: "Entrar" })).toBeVisible();
  await scan(page, testInfo, "t01-login");

  await page.goto("/register");
  await expect(page.getByRole("heading", { level: 2, name: "Criar conta" })).toBeVisible();
  await scan(page, testInfo, "t02-cadastro");
});

test.describe("T03–T09 — rotas autenticadas", () => {
  test.beforeEach(async ({ page }) => mockApi(page));

  const screens = [
    ["t03-dashboard", "/dashboard", "Clubes do livro"],
    ["t04-clube", "/clubs/1", "Entre Capítulos"],
    ["t05-livros", "/clubs/1/books", "Livros do Entre Capítulos"],
    ["t06-livro", "/books/10", "Torto Arado"],
    ["t07-encontros", "/clubs/1/meetings", "Encontros do Entre Capítulos"],
    ["t08-encontro", "/clubs/1/meetings/100", "Capítulos 8 a 14"],
    ["t09-perfil", "/profile", "Perfil"],
  ] as const;

  for (const [state, path, heading] of screens) {
    test(`${state} — estado padrão`, async ({ page }, testInfo) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await scan(page, testInfo, state);
    });
  }

  test("diálogos e menus representativos abertos", async ({ page }, testInfo) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Criar clube" }).click();
    const createClubDialog = page.getByRole("dialog", { name: "Criar clube" });
    await expect(createClubDialog).toBeVisible();
    await scan(page, testInfo, "dialogo-criar-clube");
    await createClubDialog.getByRole("button", { name: "Criar clube", exact: true }).click();
    await expect(createClubDialog.getByLabel("Nome do clube")).toBeFocused();
    await expect(createClubDialog.getByLabel("Nome do clube")).toHaveAttribute("aria-invalid", "true");
    await expect(createClubDialog.getByText("Informe o nome do clube.")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();

    await page.goto("/clubs/1");
    await page.getByRole("button", { name: "Ações do clube" }).click();
    await scan(page, testInfo, "menu-acoes-clube");
    await page.getByRole("button", { name: /Editar clube/ }).click();
    await expect(page.getByRole("dialog", { name: "Editar clube" })).toBeVisible();
    await scan(page, testInfo, "dialogo-editar-clube");
    await page.getByRole("button", { name: "Cancelar" }).click();
    await page.getByRole("button", { name: "Ações do clube" }).click();
    await page.getByRole("button", { name: /Excluir clube/ }).click();
    await scan(page, testInfo, "dialogo-excluir-clube");
    await page.getByRole("button", { name: "Cancelar" }).click();

    await page.route("http://127.0.0.1:8000/clubs/1", (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ...club, owner_id: 2, current_user_role: "membro" }),
    }));
    await page.reload();
    await page.getByRole("button", { name: /Sair do clube/ }).click();
    await scan(page, testInfo, "dialogo-sair-clube");
    await page.unroute("http://127.0.0.1:8000/clubs/1");

    await page.goto("/clubs/1/books");
    await page.getByRole("button", { name: /Cadastrar livro/ }).click();
    await scan(page, testInfo, "dialogo-cadastrar-livro");

    await page.goto("/clubs/1/meetings");
    await page.getByRole("button", { name: /Criar encontro/ }).click();
    await scan(page, testInfo, "dialogo-criar-encontro");

    await page.goto("/clubs/1/meetings/100");
    await page.getByRole("button", { name: "Ações do encontro" }).click();
    await scan(page, testInfo, "menu-acoes-encontro");
    await page.getByRole("button", { name: /Editar encontro/ }).click();
    await scan(page, testInfo, "dialogo-editar-encontro");
    await page.getByRole("button", { name: "Cancelar" }).click();
    await page.getByRole("button", { name: "Ações do encontro" }).click();
    await page.getByRole("button", { name: /Apagar encontro/ }).click();
    await scan(page, testInfo, "dialogo-apagar-encontro");
  });

  test("comentário exige revisão antes da publicação", async ({ page }) => {
    await page.goto("/books/10");
    await page.getByLabel("Novo comentário").fill("Uma leitura importante para o grupo.");
    await page.getByRole("button", { name: "Revisar comentário" }).click();
    await expect(page.getByRole("heading", { name: "Revise o comentário antes de publicar" })).toBeFocused();
    await expect(page.getByText("Uma leitura importante para o grupo.")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar publicação" }).click();
    await expect(page.getByRole("status")).toContainText("Comentário publicado no livro.");
  });
});
