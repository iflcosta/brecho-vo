# Estado Atual — Brechó na Mão

**Última atualização:** 2026-06-22 17:25
**Sessão #:** 1
**Dispositivo:** Windows
**Branch:** `main` (limpo, 4 tags)

---

## 🎯 Próximo passo imediato

**Tela 4 (Composição) — Implementar texto sobreposto (TAM, preço, hashtags) na imagem gerada**

Por quê: Tela 1, 2 e 3 estão prontas e validadas. A tia já tem o modelo virtual gerado. Agora precisa adicionar o texto (tamanho, preço, hashtags) na imagem pra ficar pronta pro Instagram.

**Decisão técnica pendente (perguntar pro Iago antes de implementar):**
- **Opção A — Client-side Canvas** (recomendado pra MVP): renderiza texto no browser, sem round-trip pro servidor. Flexível, instantâneo, mas requer `<canvas>` + download via `toDataURL()`.
- **Opção B — Server-side Cloudinary** (mais robusto): chama `/api/compose` que adiciona texto via `l_text` do Cloudinary. Consistente, alta qualidade, mas requer upload da imagem final.

Padrão recomendado: começar com **A** (Canvas) e migrar pra B se ficar lento/instável.

Como fazer (assumindo Canvas):
1. Carregar `generatedImageUrl` do localStorage (`brecho-generated-image`)
2. Carregar `productConfig` do localStorage (`brecho-product-config-v1`) pra pegar size + price + style
3. Renderizar canvas com imagem + texto sobreposto (posição padrão: rodapé)
4. Inputs editáveis pro usuário mudar texto
5. Botão "Avançar" converte canvas pra dataURL e persiste no localStorage
6. Navega pra `/caption` (Tela 5)

Arquivos a criar/modificar:
- `src/app/compose/page.tsx` (substituir placeholder)
- `src/components/compose/ComposeCanvas.tsx` (canvas com texto)
- `src/components/compose/TextEditor.tsx` (inputs editáveis)

Critérios de aceite (do SPEC):
- [ ] Texto sobreposto aparece em tempo real
- [ ] Posição do texto configurável (rodapé padrão)
- [ ] Estilo de texto (cor, fonte) consistente
- [ ] Preview mobile e desktop igual
- [ ] Botão "Avançar" desabilitado se texto vazio

---

## 📍 Onde parei

**Tela 1 + Tela 2 + Tela 3 completas e validadas.** Smoke test passou em http://localhost:3000, /config, /generate, /compose. 12 rotas compiladas, 0 erros TS, 4 tags no git (`v0.1-setup` até `v0.4-tela-3-geracao`).

Setup completo:
- Next.js 16.2.9 + React 19 + TypeScript + Tailwind 4
- Prisma 7 + Neon PostgreSQL (sa-east-1, São Paulo, 3 tabelas)
- API routes esqueleto: `/api/upload` (real), `/api/tryon` (real, fire-and-forget), `/api/caption` (esqueleto), `/api/compose` (esqueleto), `/api/settings` (real)
- Clientes lib/: `db` (singleton PrismaPg), `cloudinary` (uploadImage), `groq` (Qwen3-32B + fallback), `huggingface` (tryOn com feature flag VTON_PROVIDER)
- Hooks: `useTryOn` (POST + polling 3s + timeout 90s)
- Componentes UI: Button (tia-friendly ≥48px), LgpdBanner, SizePills
- Persistência localStorage entre telas (`brecho-original-image`, `brecho-product-config-v1`, `brecho-generated-image`)

**Decisões de stack fechadas 22/06/2026:**
- Vercel Hobby (R$ 0/mês, com plano B Cloudflare documentado em `../docs/PESQUISA-CLOUDFLARE-PLANO-B.md`)
- Groq Qwen3-32B + Cerebras/OpenRouter fallback (legendas)
- HF Spaces OutfitAnyone + FASHN upgrade (VTON)
- Cloudinary (imagens), Neon (banco), Prisma 7 (ORM)
- Hosting interno `/api/tryon` é fire-and-forget (Vercel Hobby aguenta 300s, VTON 30-90s)

---

## 🐛 Bugs conhecidos

- **`callHFSpace()` em `lib/huggingface/client.ts` é PLACEHOLDER** — retorna a imagem original. O fluxo POST → polling → status update tá 100% funcional, mas a chamada real ao HF Spaces precisa ser implementada quando o Iago decidir qual Space usar.
- **LGPD banner** renderiza após hidratação (devido a `useEffect`), pode ter flash inicial se a JS demorar a carregar. Mitigação futura: SSR com cookie de consent.
- **`/api/tryon` GET** usa Prisma direto (sem cache). Em escala, valeria KV/Redis pra reduzir queries.

---

## 💡 Decisões tomadas durante o desenvolvimento

1. **22/06**: **Vercel Hobby** em vez de Cloudflare (R$ 0/mês, DX superior, risco do TOS assumido)
2. **22/06**: **Plano B Cloudflare** documentado em `docs/PESQUISA-CLOUDFLARE-PLANO-B.md` caso Vercel reclame
3. **22/06**: **Prisma 7** detectado e adaptado (`prisma.config.ts` separado, `prisma.config.ts` com helper `env()` + `dotenv/config`)
4. **22/06**: **`gradio_client` removido** — só tem versão Python. VTON via fetch HTTP direto pra API Gradio (a fazer na Tela 3 → hoje é placeholder)
5. **22/06**: **Branch renomeada** `master` → `main` (padrão GitHub)
6. **22/06**: **autocrlf** configurado (`true` no Windows) pra evitar warnings de CRLF
7. **22/06**: **Credenciais configuradas** — Cloudinary (`dmqqkv4ru`), Groq (`gsk_...`), Neon (sa-east-1)
8. **22/06**: **Migração Prisma aplicada** — 3 tabelas criadas no Neon (`Settings`, `Post`, `Generation`)
9. **22/06**: **`/api/tryon` virou fire-and-forget** — POST cria Generation(status=processing) e processa em background; GET faz polling. Cleanup de timers + AbortController no unmount do hook.
10. **22/06**: **Tela 1 (Upload)** — drag&drop, preview, validação, LGPD banner persistente em localStorage
11. **22/06**: **Tela 2 (Config)** — form com Zod, SizePills, máscara de preço, persistência localStorage
12. **22/06**: **schema/config.ts** — single source of truth pra tipos de roupa, tamanhos, estilos + parser de preço (`parsePriceString`)
13. **22/06**: **Tela 3 (Geração)** — hook `useTryOn` com state machine completa, timeout 90s, limite de 3 regen
14. **22/06**: **Vercel Hobby maxDuration atualizado** — 300s (5 min) em 2026, não 10s como em docs antigas. Cobre VTON 30-90s tranquilamente.

---

## 📂 Arquivos modificados nesta sessão

```
A  prisma/schema.prisma                   (Settings, Post, Generation)
A  prisma.config.ts                        (Prisma 7+ config — env() + dotenv)
A  prisma/migrations/20260622181200_init/  (primeira migração — Neon)
A  .env.example                            (template de env vars)
A  .env                                    (Prisma CLI — DATABASE_URL)
A  .env.local                              (Next.js local — Cloudinary, Groq, Neon)
A  .sdd-context                            (resumo IA-first)
A  ROADMAP.md                              (status das seções)
A  AGENTS.md                               (regras de trabalho da IA)
A  STATE.md                                (este arquivo)
M  AGENTS.md                               (substituído pelo do projeto)
A  src/lib/db/prisma.ts                    (singleton + PrismaPg adapter)
A  src/lib/cloudinary/client.ts            (uploadImage)
A  src/lib/groq/client.ts                  (LLM + fallback multi-provider)
A  src/lib/huggingface/client.ts           (VTON + feature flag; callHFSpace = placeholder)
A  src/lib/utils.ts                        (cn, formatPrice, isValidUrl)
A  src/lib/schemas/config.ts               (Zod + GARMENT_TYPES, SIZES, STYLES + parsePriceString)
A  src/lib/hooks/use-tryon.ts              (POST + polling + timeout 90s + cleanup)
A  src/components/ui/button.tsx            (Button base, ≥48px altura)
A  src/components/upload/UploadZone.tsx    (drag&drop + tap + validação + camera mobile)
A  src/components/upload/UploadPreview.tsx (preview da imagem selecionada)
A  src/components/upload/LgpdBanner.tsx    (consentimento LGPD persistente)
A  src/components/config/ConfigForm.tsx    (form com react-hook-form + zodResolver)
A  src/components/config/SizePills.tsx     (PP/P/M/G/GG selecionáveis)
A  src/components/generation/GeneratingState.tsx (loading com tempo estimado)
A  src/components/generation/GeneratedPreview.tsx (preview + Regerar 3x + Avançar)
A  src/app/api/upload/route.ts             (Tela 1 — POST + Cloudinary)
A  src/app/api/tryon/route.ts              (Tela 3 — POST fire-and-forget + GET polling)
A  src/app/api/caption/route.ts            (Tela 5 — esqueleto)
A  src/app/api/compose/route.ts            (Tela 4 — esqueleto)
A  src/app/api/settings/route.ts           (Configurações — GET/PUT)
A  src/app/page.tsx                        (Tela 1 — Upload)
A  src/app/config/page.tsx                 (Tela 2 — Config)
A  src/app/generate/page.tsx               (Tela 3 — Geração)
A  src/app/compose/page.tsx                (Tela 4 — placeholder)
A  .gitignore                              (+ Thumbs.db, .dev.log, .dev.err)
```

---

## 🔑 Contexto importante que NÃO está no SPEC

- **tia usa Android Realme**, testar com 360x800 width
- **Wi-Fi da loja é instável** — sempre testar com e sem rede
- **tia prefere botões grandes** (mínimo 48px de altura, padding generoso)
- **Vercel Hobby em 2026 tem maxDuration 300s** (5 min) — mudou do 10s antigo
- **Prisma 7+ mudou a API**: `prisma.config.ts` separado do schema, não usa mais `url` no `datasource`, e `PrismaClient` precisa de adapter explícito (`@prisma/adapter-pg`)
- **HF Spaces**: client Python não roda em Node — precisa HTTP fetch direto pra API Gradio (a fazer)
- **Next.js 16** (não 15 como o SPEC dizia) — `create-next-app@latest` já tá no 16.2.9, estável em 2026
- **`gradio_client`** foi removido do projeto — só tem Python. VTON vai via fetch HTTP direto pra API Gradio
- **`capture="environment"`** no input file aciona câmera traseira no mobile
- **Limite de 3 regen** na Tela 3 é hardcoded (não veio de env), mas tá fácil de mudar pra env var se precisar
- **Tag v0.X-<seção>** — convenção de versionamento por seção (1 por seção completa)

---

## ⏸️ Última ação antes da pausa

Atualização completa de contexto pra retomar em outro device. **Próxima sessão: ler este STATE.md primeiro (1-2 min), depois começar Tela 4 (Composição).**

Decisão técnica pendente pro próximo chat: **Canvas (client) vs Cloudinary (server)** pro texto sobreposto. Perguntar pro Iago antes de codar.

---

## 🚀 Como retomar (comando pro Iago)

Em outra sessão / device, abrir o Mavis e digitar:

> "Continuar Brechó na Mão. Estado em STATE.md. Próxima seção: Tela 4 (Composição)."

A IA vai:
1. Ler `.sdd-context` (50 linhas, contexto imediato)
2. Ler `STATE.md` (estado detalhado — onde parei, decisões, próximos passos)
3. Ler `ROADMAP.md` (visão geral de todas as seções)
4. Confirmar: "Tá na Tela 4 (Composição). Posso começar?"
5. **Perguntar sobre Canvas vs Cloudinary** antes de codar
6. Implementar e atualizar contexto a cada passo

---

*Próxima sessão: ler este STATE.md primeiro (1-2 min), depois Tela 4 (Composição).*
