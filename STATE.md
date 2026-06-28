# Estado Atual \u2014 Brech\u00f3 na M\u00e3o

**\u00daltima atualiza\u00e7\u00e3o:** 2026-06-28 14:18
**Sess\u00e3o #:** 2
**Dispositivo:** Windows
**Branch:** `main` (limpo, 5 tags)

---

## \ud83c\udfaf Pr\u00f3ximo passo imediato

**Tela 5 (Legenda) \u2014 Gerar legenda de Instagram via Groq Qwen3-32B + edit inline + download**

Por qu\u00ea: Tela 1, 2, 3 e 4 est\u00e3o prontas e validadas via smoke test. A tia j\u00e1 tem:
- Imagem gerada com modelo virtual (Tela 3)
- Imagem composta com TAM/pre\u00e7o/hashtags (Tela 4)

Agora precisa da **legenda em texto** pra colar no Instagram junto com a imagem.

**Decis\u00e3o t\u00e9cnica pendente (perguntar pro Iago antes de implementar):**
- **Op\u00e7\u00e3o A \u2014 Edit\u00e1vel inline:** gera legenda via Groq, mostra em textarea, usu\u00e1rio edita livremente. Simples e flex\u00edvel.
- **Op\u00e7\u00e3o B \u2014 Sugest\u00f5es m\u00faltiplas:** gera 3 varia\u00e7\u00f5es de legenda, usu\u00e1rio escolhe uma + edita. Mais "m\u00e1gico" mas mais complexo.
- **Op\u00e7\u00e3o C \u2014 H\u00edbrido (recomendado):** gera 1 legenda via Groq + mostra bot\u00e3o "Gerar outra" pra mais 2-3 varia\u00e7\u00f5es.

Como fazer (assumindo Op\u00e7\u00e3o C):
1. Carregar `finalImageUrl` do localStorage (`brecho-final-image`)
2. Carregar `productConfig` do localStorage (`brecho-product-config-v1`) pra usar como contexto
3. Bot\u00e3o "Gerar legenda" chama POST `/api/caption` com `{ garmentType, size, price, style, description }`
4. Groq retorna legenda (template + varia\u00e7\u00f5es)
5. Textarea mostra a legenda gerada, usu\u00e1rio edita
6. Bot\u00e3o "Gerar outra" pede outra varia\u00e7\u00e3o
7. Bot\u00e3o "Copiar legenda" copia pro clipboard
8. Bot\u00e3o "Baixar imagem" baixa a imagem composta (do `finalImageUrl`)
9. Mensagem motivacional: "Pronto pra postar! \ud83d\ude80"

Arquivos a criar/modificar:
- `src/app/api/caption/route.ts` (substituir skeleton \u2014 chamada Groq real)
- `src/app/caption/page.tsx` (nova p\u00e1gina)
- `src/components/caption/CaptionGenerator.tsx` (bot\u00e3o + estado)
- `src/components/caption/CaptionEditor.tsx` (textarea edit\u00e1vel)
- `src/components/caption/DownloadButton.tsx` (download da imagem)

Crit\u00e9rios de aceite (do STATE anterior):
- [ ] Legenda gerada em <5s
- [ ] Pelo menos 3 varia\u00e7\u00f5es dispon\u00edveis (bot\u00e3o "Gerar outra")
- [ ] Edit inline funcional
- [ ] Bot\u00e3o "Copiar" funcional
- [ ] Bot\u00e3o "Baixar imagem" baixa arquivo `.jpg`
- [ ] Mensagem motivacional de "Pronto pra postar!"

---

## \ud83d\udd04 Onde parei

**Tela 1 + Tela 2 + Tela 3 + Tela 4 completas e validadas.** Smoke test passou em http://localhost:3001, 4 endpoints + 4 p\u00e1ginas, 0 erros TS, 5 tags no git (`v0.1-setup` at\u00e9 `v0.5-tela-4-composicao`).

Setup completo:
- Next.js 16.2.9 + React 19 + TypeScript + Tailwind 4
- Prisma 7 + Neon PostgreSQL (sa-east-1, S\u00e3o Paulo, 3 tabelas)
- API routes REAIS:
  - `/api/upload` (Tela 1 \u2014 Cloudinary)
  - `/api/tryon` (Tela 3 \u2014 VTON real via HF Spaces)
  - `/api/compose` (Tela 4 \u2014 Cloudinary overlay)
  - `/api/caption` (Tela 5 \u2014 ainda skeleton)
  - `/api/settings` (Settings CRUD)
- Clientes lib/: `db` (singleton PrismaPg), `cloudinary` (uploadImage + buildComposedUrl), `groq` (Qwen3-32B), `huggingface` (VTON REAL com Gradio HTTP API)
- Hooks: `useTryOn` (POST + polling 3s + timeout 90s)
- Componentes UI: Button, LgpdBanner, SizePills, ConfigForm, UploadZone, UploadPreview, GeneratingState, GeneratedPreview, **ComposeForm**, **ComposedPreview**
- Persist\u00eancia localStorage entre telas (`brecho-original-image`, `brecho-product-config-v1`, `brecho-generated-image`, `brecho-final-image`)

**Decis\u00f5es de stack fechadas 22/06/2026 \u2192 28/06/2026:**
- Vercel Hobby (R$ 0/m\u00eas, com plano B Cloudflare documentado em `../docs/PESQUISA-CLOUDFLARE-PLANO-B.md`)
- Groq Qwen3-32B + Cerebras/OpenRouter fallback (legendas) \u2014 Cerebras/OpenRouter pendente Tela 5
- HF Spaces Kolors + OutfitAnyone + OOTDiffusion (VTON) \u2014 **AGORA REAL com fallback chain**
- Cloudinary (imagens + overlay), Neon (banco), Prisma 7 (ORM)
- Hosting interno `/api/tryon` \u00e9 fire-and-forget (Vercel Hobby aguenta 300s, VTON 30-90s)
- **Tela 4: Cloudinary overlay** (Op\u00e7\u00e3o B confirmada 28/06) \u2014 3 layers verticais sem re-upload

---

## \ud83d\udc1b Bugs conhecidos

- **LGPD banner** renderiza ap\u00f3s hidrata\u00e7\u00e3o (devido a `useEffect`), pode ter flash inicial se a JS demorar a carregar. Mitiga\u00e7\u00e3o futura: SSR com cookie de consent.
- **`/api/tryon` GET** usa Prisma direto (sem cache). Em escala, valeria KV/Redis pra reduzir queries.
- **HF Spaces** podem ter cold-start 30-60s no primeiro request. Timeout de 90s por Space cobre isso com folga.
- **Cloudinary text overlay** pode quebrar com emojis ou caracteres muito especiais. Mitiga\u00e7\u00e3o: encoding robusto (escape de `,`, `/`, `:`, `\\`).

---

## \ud83d\udcdd Decis\u00f5es tomadas durante o desenvolvimento

1. **22/06**: **Vercel Hobby** em vez de Cloudflare (R$ 0/m\u00eas, DX superior, risco do TOS assumido)
2. **22/06**: **Plano B Cloudflare** documentado em `docs/PESQUISA-CLOUDFLARE-PLANO-B.md` caso Vercel reclame
3. **22/06**: **Prisma 7** detectado e adaptado (`prisma.config.ts` separado, `prisma.config.ts` com helper `env()` + `dotenv/config`)
4. **22/06**: **`gradio_client` removido** \u2014 s\u00f3 tem vers\u00e3o Python. VTON via fetch HTTP direto pra API Gradio
5. **22/06**: **Branch renomeada** `master` \u2192 `main` (padr\u00e3o GitHub)
6. **22/06**: **autocrlf** configurado (`true` no Windows) pra evitar warnings de CRLF
7. **22/06**: **Credenciais configuradas** \u2014 Cloudinary (`dmqqkv4ru`), Groq (`gsk_...`), Neon (sa-east-1)
8. **22/06**: **Migra\u00e7\u00e3o Prisma aplicada** \u2014 3 tabelas criadas no Neon (`Settings`, `Post`, `Generation`)
9. **22/06**: **`/api/tryon` virou fire-and-forget** \u2014 POST cria Generation(status=processing) e processa em background; GET faz polling. Cleanup de timers + AbortController no unmount do hook.
10. **22/06**: **Tela 1 (Upload)** \u2014 drag&drop, preview, valida\u00e7\u00e3o, LGPD banner persistente em localStorage
11. **22/06**: **Tela 2 (Config)** \u2014 form com Zod, SizePills, m\u00e1scara de pre\u00e7o, persist\u00eancia localStorage
12. **22/06**: **schema/config.ts** \u2014 single source of truth pra tipos de roupa, tamanhos, estilos + parser de pre\u00e7o (`parsePriceString`)
13. **22/06**: **Tela 3 (Gera\u00e7\u00e3o)** \u2014 hook `useTryOn` com state machine completa, timeout 90s, limite de 3 regen
14. **22/06**: **Vercel Hobby maxDuration atualizado** \u2014 300s (5 min) em 2026, n\u00e3o 10s como em docs antigas. Cobre VTON 30-90s tranquilamente.
15. **28/06**: **Tela 4 (Composi\u00e7\u00e3o) \u2014 Cloudinary server-side overlay** \u2014 3 layers verticais no rodap\u00e9 (TAM 80 + pre\u00e7o 70 + rodap\u00e9 36), parser de URL Cloudinary pra extrair publicId+version, auto-preview com debounce 400ms
16. **28/06**: **`callHFSpace()` REAL** \u2014 fetch HTTP pra API Gradio (`/gradio_api/queue/join` + SSE em `/gradio_api/queue/data`), chain de fallback (Kolors \u2192 OutfitAnyone \u2192 OOTDiffusion), cold-start handling 30-60s, timeout 90s, parser gen\u00e9rico de output (v\u00e1rios formatos Gradio)

---

## \ud83d\udcc4 Arquivos modificados nesta sess\u00e3o (#2 \u2014 28/06/2026)

```
A  src/lib/cloudinary/parsePublicId.ts             (extrai publicId+version de URL Cloudinary)
M  src/lib/cloudinary/client.ts                    (+ buildComposedUrl, + encodeCloudinaryText)
A  src/lib/schemas/compose.ts                      (Zod: composeRequestSchema, composeFormSchema, ComposePosition)
A  src/components/compose/ComposeForm.tsx          (form edit\u00e1vel TAM/pre\u00e7o/hashtags/@loja/posi\u00e7\u00e3o, debounce 400ms)
A  src/components/compose/ComposedPreview.tsx      (preview da imagem composta + loading/error)
M  src/app/compose/page.tsx                        (placeholder \u2192 real: orquestra form + preview + localStorage)
M  src/app/api/compose/route.ts                    (skeleton \u2192 real: parse URL + buildComposedUrl + Zod)
M  src/lib/huggingface/client.ts                   (callHFSpace PLACEHOLDER \u2192 REAL com Gradio HTTP API + SSE)
```

## \ud83d\udcc4 Arquivos modificados na sess\u00e3o #1 (22/06/2026) \u2014 base

```
A  prisma/schema.prisma                            (Settings, Post, Generation)
A  prisma.config.ts                                (Prisma 7+ config \u2014 env() + dotenv)
A  prisma/migrations/20260622181200_init/          (primeira migra\u00e7\u00e3o \u2014 Neon)
A  .env.example                                    (template de env vars)
A  .sdd-context                                    (resumo IA-first)
A  ROADMAP.md                                      (status das se\u00e7\u00f5es)
A  AGENTS.md                                       (regras de trabalho da IA)
A  STATE.md                                        (este arquivo)
A  src/lib/db/prisma.ts                            (singleton + PrismaPg adapter)
A  src/lib/cloudinary/client.ts                    (uploadImage)
A  src/lib/groq/client.ts                          (LLM + fallback multi-provider)
A  src/lib/huggingface/client.ts                   (VTON + feature flag; callHFSpace = placeholder)
A  src/lib/utils.ts                                (cn, formatPrice, isValidUrl)
A  src/lib/schemas/config.ts                       (Zod + GARMENT_TYPES, SIZES, STYLES + parsePriceString)
A  src/lib/hooks/use-tryon.ts                      (POST + polling + timeout 90s + cleanup)
A  src/components/ui/button.tsx                    (Button base, \u226548px altura)
A  src/components/upload/UploadZone.tsx            (drag&drop + tap + valida\u00e7\u00e3o + camera mobile)
A  src/components/upload/UploadPreview.tsx         (preview da imagem selecionada)
A  src/components/upload/LgpdBanner.tsx            (consentimento LGPD persistente)
A  src/components/config/ConfigForm.tsx            (form com react-hook-form + zodResolver)
A  src/components/config/SizePills.tsx             (PP/P/M/G/GG selecion\u00e1veis)
A  src/components/generation/GeneratingState.tsx   (loading com tempo estimado)
A  src/components/generation/GeneratedPreview.tsx  (preview + Regerar 3x + Avan\u00e7ar)
A  src/app/api/upload/route.ts                     (Tela 1 \u2014 POST + Cloudinary)
A  src/app/api/tryon/route.ts                      (Tela 3 \u2014 POST fire-and-forget + GET polling)
A  src/app/api/caption/route.ts                    (Tela 5 \u2014 esqueleto)
A  src/app/api/compose/route.ts                    (Tela 4 \u2014 esqueleto)
A  src/app/api/settings/route.ts                   (Configura\u00e7\u00f5es \u2014 GET/PUT)
A  src/app/page.tsx                                (Tela 1 \u2014 Upload)
A  src/app/config/page.tsx                         (Tela 2 \u2014 Config)
A  src/app/generate/page.tsx                       (Tela 3 \u2014 Gera\u00e7\u00e3o)
A  src/app/compose/page.tsx                        (Tela 4 \u2014 placeholder)
```

---

## \ud83d\udcdd Contexto importante que N\u00c3O est\u00e1 no SPEC

- **tia usa Android Realme**, testar com 360x800 width
- **Wi-Fi da loja \u00e9 inst\u00e1vel** \u2014 sempre testar com e sem rede
- **tia prefere bot\u00f5es grandes** (m\u00ednimo 48px de altura, padding generoso)
- **Vercel Hobby em 2026 tem maxDuration 300s** (5 min) \u2014 mudou do 10s antigo
- **Prisma 7+ mudou a API**: `prisma.config.ts` separado do schema, n\u00e3o usa mais `url` no `datasource`, e `PrismaClient` precisa de adapter expl\u00edcito (`@prisma/adapter-pg`)
- **HF Spaces (Gradio API)**: client Python n\u00e3o roda em Node \u2014 fetch HTTP direto pra `/gradio_api/queue/join` (POST) + `/gradio_api/queue/data` (SSE). Output varia por Space \u2014 parser gen\u00e9rico cobre `image.url`, `value`, `path`, data URL
- **Next.js 16** (n\u00e3o 15 como o SPEC dizia) \u2014 `create-next-app@latest` j\u00e1 t\u00e1 no 16.2.9, est\u00e1vel em 2026
- **`gradio_client`** foi removido do projeto \u2014 s\u00f3 tem Python. VTON vai via fetch HTTP direto pra API Gradio
- **`capture="environment"`** no input file aciona c\u00e2mera traseira no mobile
- **Limite de 3 regen** na Tela 3 \u00e9 hardcoded (n\u00e3o veio de env), mas t\u00e1 f\u00e1cil de mudar pra env var se precisar
- **Tag v0.X-<se\u00e7\u00e3o>** \u2014 conven\u00e7\u00e3o de versionamento por se\u00e7\u00e3o (1 por se\u00e7\u00e3o completa)
- **Cloudinary text overlay** (Tela 4) \u2014 escape `,` `/` `:` `\\` no texto. 3 layers: TAM (80), pre\u00e7o (70), rodap\u00e9 (36). y_offset decrescente (200, 110, 30) empilha no rodap\u00e9
- **Cloudinary free tier 2026**: 25 credits/m\u00eas = ~25k transforma\u00e7\u00f5es OU 25 GB storage OU 25 GB bandwidth. Pra MVP com 5-10 posts/dia, sobra folga absurda

---

## \ud83d\ude80 \u00daltima a\u00e7\u00e3o antes da pausa

Tela 4 (Composi\u00e7\u00e3o) implementada e validada via smoke test:
- `GET /api/compose` \u2192 200 healthcheck
- `POST /api/compose` v\u00e1lido \u2192 200 com composedUrl Cloudinary (3 layers)
- `POST /api/compose` inv\u00e1lido \u2192 400 com details do Zod
- `GET /compose` \u2192 200 p\u00e1gina renderiza
- Build: 12 rotas, 0 erros TS, 5 tags no git

Al\u00e9m disso, **`callHFSpace()` foi promovido de placeholder pra real** \u2014 agora Tela 3 funciona end-to-end de verdade (VTON real via Kolors/OutfitAnyone/OOTDiffusion).

**Pr\u00f3xima sess\u00e3o: ler este STATE.md primeiro (1-2 min), depois Tela 5 (Legenda).**

Decis\u00e3o t\u00e9cnica pendente pro pr\u00f3ximo chat: **A (simples), B (3 varia\u00e7\u00f5es upfront), ou C (h\u00edbrido)** pra gera\u00e7\u00e3o de legenda. Perguntar pro Iago antes de codar.

---

## \ud83d\udc4d Como retomar (comando pro Iago)

Em outra sess\u00e3o / device, abrir o Mavis e digitar:

> "Continuar Brech\u00f3 na M\u00e3o. Estado em STATE.md. Pr\u00f3xima se\u00e7\u00e3o: Tela 5 (Legenda)."

A IA vai:
1. Ler `.sdd-context` (50 linhas, contexto imediato)
2. Ler `STATE.md` (estado detalhado \u2014 onde parei, decis\u00f5es, pr\u00f3ximos passos)
3. Ler `ROADMAP.md` (vis\u00e3o geral de todas as se\u00e7\u00f5es)
4. Confirmar: "T\u00e1 na Tela 5 (Legenda). Posso come\u00e7ar?"
5. **Perguntar sobre A/B/C** antes de codar
6. Implementar e atualizar contexto a cada passo

---

*Pr\u00f3xima sess\u00e3o: ler este STATE.md primeiro (1-2 min), depois Tela 5 (Legenda).*