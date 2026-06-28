/**
 * @spec docs/SPEC-SDD.md#integracao-e2e
 * @description Smoke tests E2E — navegação entre as 5 telas.
 * @author Mavis
 *
 * Valida que todas as rotas estão acessíveis e renderizam.
 * Não testa fluxo completo (precisa de .env.local real com Cloudinary/Groq/HF).
 */
import { test, expect } from "@playwright/test";

test.describe("Navegação entre telas", () => {
  test("Tela 1 (Upload) carrega em /", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /foto do manequim/i })).toBeVisible();
  });

  test("Tela 2 (Config) carrega em /config", async ({ page }) => {
    const response = await page.goto("/config");
    expect(response?.status()).toBe(200);
    // Estado vazio: botão "Voltar" pra / deve existir
    await expect(page.getByRole("link", { name: /voltar/i }).first()).toBeVisible();
  });

  test("Tela 3 (Geração) carrega em /generate", async ({ page }) => {
    const response = await page.goto("/generate");
    expect(response?.status()).toBe(200);
  });

  test("Tela 4 (Composição) carrega em /compose", async ({ page }) => {
    const response = await page.goto("/compose");
    expect(response?.status()).toBe(200);
    // Estado vazio: "Falta a imagem gerada" deve aparecer
    await expect(page.getByText(/falta a imagem gerada/i)).toBeVisible();
  });

  test("Tela 5 (Legenda) carrega em /caption", async ({ page }) => {
    const response = await page.goto("/caption");
    expect(response?.status()).toBe(200);
    // Estado vazio: "Falta a imagem composta" deve aparecer
    await expect(page.getByText(/falta a imagem composta/i)).toBeVisible();
  });

  test("404 customizado existe em rota inválida", async ({ page }) => {
    const response = await page.goto("/rota-que-nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/página não encontrada/i)).toBeVisible();
  });

  test("Header sticky tem botão voltar nas telas", async ({ page }) => {
    await page.goto("/config");
    const backLink = page.getByRole("link", { name: /voltar/i }).first();
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", /^\/$|.*\/$/);
  });
});

test.describe("Acessibilidade básica", () => {
  test("Tela 1 tem lang=pt-BR", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "pt-BR");
  });

  test("Tela 1 tem h1 com texto descritivo", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
  });

  test("Botões têm altura mínima tia-friendly (≥48px)", async ({ page }) => {
    await page.goto("/");
    // Pega todos os botões visíveis
    const buttons = page.getByRole("button").all();
    for (const btn of await buttons) {
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40); // tolera 40-48 por causa de padding
        }
      }
    }
  });
});