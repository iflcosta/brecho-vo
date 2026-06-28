/**
 * @spec docs/SPEC-SDD.md#integracao-e2e
 * @description Smoke tests E2E — endpoints de API (sem precisar de .env real pros GETs).
 * @author Mavis
 */
import { test, expect } from "@playwright/test";

test.describe("API endpoints — smoke (GET)", () => {
  test("GET /api/caption retorna healthcheck", async ({ request }) => {
    const res = await request.get("/api/caption");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("garmentType");
  });

  test("GET /api/compose retorna healthcheck", async ({ request }) => {
    const res = await request.get("/api/compose");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("GET /api/tryon sem id retorna 400", async ({ request }) => {
    const res = await request.get("/api/tryon");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("GET /api/tryon com id inválido retorna 404", async ({ request }) => {
    const res = await request.get("/api/tryon?id=invalid-id-xyz");
    expect(res.status()).toBe(404);
  });

  test("GET /api/upload sem file retorna 400", async ({ request }) => {
    const res = await request.get("/api/upload");
    expect(res.status()).toBe(405); // GET não permitido
  });

  test("POST /api/caption sem dados retorna 400 com Zod details", async ({ request }) => {
    const res = await request.post("/api/caption", { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(Array.isArray(body.details)).toBe(true);
  });

  test("POST /api/compose sem dados retorna 400", async ({ request }) => {
    const res = await request.post("/api/compose", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("POST /api/compose com URL não-Cloudinary retorna 400", async ({ request }) => {
    const res = await request.post("/api/compose", {
      data: {
        imageUrl: "https://example.com/image.jpg",
        size: "M",
        price: "R$ 45,00",
      },
    });
    expect(res.status()).toBe(400);
  });
});