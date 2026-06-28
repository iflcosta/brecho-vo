# Estado Atual \u2014 Brech\u00f3 na M\u00e3o

**\u00daltima atualiza\u00e7\u00e3o:** 2026-06-28 15:20
**Sess\u00e3o #:** 3
**Dispositivo:** Windows
**Branch:** `main` (limpo, 6 tags)

---

## \ud83c\udfaf Pr\u00f3ximo passo imediato

**Integra\u00e7\u00e3o E2E \u2014 Validar fluxo completo Upload \u2192 Download no navegador + mobile**

**Status (28/06):** Setup completo (error boundaries, Playwright, checklist). Falta valida\u00e7\u00e3o manual do Iago no navegador.

Por qu\u00ea: As 5 telas est\u00e3o implementadas e o build passa com 0 erros TS. Mas o Iago precisa rodar o app no navegador (com `.env.local` real) pra confirmar:
1. Cada tela renderiza corretamente no mobile (Android Realme 360x800)
2. localStorage persiste entre navega\u00e7\u00f5es
3. Bot\u00f5es grandes (\u226548px) e fluxo intuitivo pra tia
4. Cloudinary overlay visualmente OK (texto leg\u00edvel, posi\u00e7\u00e3o certa)
5. VTON real funciona (callHFSpace com Kolors/OutfitAnyone)
6. Groq gera legenda em PT-BR de qualidade

**Crit\u00e9rios de aceite da Integra\u00e7\u00e3o E2E:**
- [ ] Fluxo Upload \u2192 Config \u2192 Generate \u2192 Compose \u2192 Caption funciona end-to-end
- [ ] Imagem composta \u00e9 baixada com sucesso
- [ ] Legenda gerada \u00e9 coerente com a pe\u00e7a (testar com 3-5 pe\u00e7as diferentes)
- [ ] Mobile: testar em Android Chrome (DevTools mobile view)
- [ ] Sem erros no console do browser
- [ ] LGPD banner aparece na primeira visita
- [ ] localStorage n\u00e3o quebra entre telas

**Como fazer:**
1. Subir dev server local com `.env.local` real (Neon + Cloudinary + Groq + HF Token)
2. Acessar `http://localhost:3000` no browser
3. Testar o fluxo completo com uma foto real do manequim
4. Validar visualmente cada tela (especialmente Cloudinary overlay)
5. Anotar bugs em `STATE.md` \u2192 "Bugs conhecidos"
6. Ajustar CSS/Tailwind se algo quebrar no mobile

Poss\u00edveis ajustes:
- **Tela 4 overlay:** se texto ficar cortado ou mal posicionado, ajustar `y_offset` no `buildComposedUrl`
- **Tela 5:** se Groq gerar legenda muito longa, aumentar max_tokens ou cortar no client
- **localStorage keys:** se quebrar entre navega\u00e7\u00f5es (ex: SSR mismatch), adicionar tratamento

---

## \ud83d\udd04 Onde parei

**Tela 1 + Tela 2 + Tela 3 + Tela 4 + Tela 5 completas. Build passa com 0 erros TS, 13 rotas.**

Setup completo:
- Next.js 16.2.9 + React 19 + TypeScript + Tailwind 4
- Prisma 7 + Neon PostgreSQL (sa-east-1, S\u00e3o Paulo, 3 tabelas)
- 5 API routes REAIS: `/api/upload`, `/api/tryon`, `/api/compose`, `/api/caption`, `/api/settings`
- Clientes lib/: `db`, `cloudinary` (uploadImage + buildComposedUrl), `groq` (generateCaption + generateCaptions), `huggingface` (tryOn REAL)
- 15+ componentes: Button, LgpdBanner, SizePills, ConfigForm, UploadZone, UploadPreview, GeneratingState, GeneratedPreview, ComposeForm, ComposedPreview, **CaptionGenerator, CaptionEditor, CaptionActions, DownloadButton**
- Persist\u00eancia localStorage: `brecho-original-image`, `brecho-product-config-v1`, `brecho-generated-image`, `brecho-final-image`

**Decis\u00f5es de stack fechadas:**
- Vercel Hobby (R$ 0/m\u00eas, plano B Cloudflare documentado)
- Groq Qwen3-32B + fallback Cerebras/OpenRouter pendente
- HF Spaces Kolors + OutfitAnyone + OOTDiffusion (VTON REAL, fallback chain)
- Cloudinary (upload + overlay) \u2014 3 layers verticais no rodap\u00e9
- **Tela 5: Op\u00e7\u00e3o C h\u00edbrida** \u2014 gera 1 + bot\u00e3o "Gerar outra" + "Gerar 3 varia\u00e7\u00f5es"
- Job VTON fire-and-forget (Vercel Hobby aguenta 300s, VTON 30-90s)

---

## \ud83d\udc1b Bugs conhecidos

- **LGPD banner** renderiza ap\u00f3s hidrata\u00e7\u00e3o (flash inicial). Mitiga\u00e7\u00e3o: SSR com cookie de consent.
- **`/api/tryon` GET** sem cache (Prisma direto). Em escala, valeria KV/Redis.
- **HF Spaces** podem ter cold-start 30-60s. Timeout 90s por Space cobre.
- **Cloudinary text overlay** \u2014 emojis podem renderizar mal em alguns sistemas.
- **Download de imagem no iOS Safari** \u2014 fallback `window.open` + "long press" pode ser necess\u00e1rio (testar).
- **Dev server local crasha silenciosamente** neste ambiente (porta 3000 ocupada por outro projeto CyberGaming Arena) \u2014 mas build funciona OK.

---

## \ud83d\udcdd Decis\u00f5es tomadas durante o desenvolvimento

1. **22/06**: **Vercel Hobby** em vez de Cloudflare (R$ 0/m\u00eas, DX superior, risco do TOS assumido)
2. **22/06**: **Plano B Cloudflare** documentado em `docs/PESQUISA-CLOUDFLARE-PLANO-B.md`
3. **22/06**: **Prisma 7** detectado e adaptado (`prisma.config.ts` separado + `env()` + `dotenv/config`)
4. **22/06**: **`gradio_client` removido** \u2014 s\u00f3 tem Python. VTON via fetch HTTP direto pra API Gradio
5. **22/06**: **Branch renomeada** `master` \u2192 `main`
6. **22/06**: **autocrlf** configurado (`true` no Windows)
7. **22/06**: **Credenciais configuradas** \u2014 Cloudinary (`dmqqkv4ru`), Groq (`gsk_...`), Neon (sa-east-1)
8. **22/06**: **Migra\u00e7\u00e3o Prisma aplicada** \u2014 3 tabelas no Neon
9. **22/06**: **`/api/tryon` virou fire-and-forget** \u2014 POST cria Generation(status=processing) e processa em background
10. **22/06**: **Tela 1 (Upload)** \u2014 drag&drop, preview, valida\u00e7\u00e3o, LGPD persistente
11. **22/06**: **Tela 2 (Config)** \u2014 form com Zod, SizePills, m\u00e1scara de pre\u00e7o
12. **22/06**: **schema/config.ts** \u2014 single source of truth pra tipos/tamanhos/estilos
13. **22/06**: **Tela 3 (Gera\u00e7\u00e3o)** \u2014 hook `useTryOn` com state machine completa
14. **22/06**: **Vercel Hobby maxDuration** \u2014 300s (5 min) em 2026
15. **28/06**: **Tela 4 (Composi\u00e7\u00e3o) \u2014 Cloudinary server-side overlay** \u2014 3 layers verticais (TAM 80 + pre\u00e7o 70 + rodap\u00e9 36)
16. **28/06**: **`callHFSpace()` REAL** \u2014 fetch HTTP pra Gradio API (queue/join + SSE em queue/data), fallback chain
17. **28/06**: **Tela 5 (Legenda) \u2014 Op\u00e7\u00e3o C h\u00edbrida** \u2014 1 legenda + bot\u00e3o "Gerar outra" + "Gerar 3 varia\u00e7\u00f5es" em paralelo
18. **28/06**: **Tom da legenda** \u2014 3 op\u00e7\u00f5es (casual/elegante/divertido) com pills
19. **28/06**: **Download de imagem** \u2014 fetch+blob+anchor (fallback: window.open pra iOS)

---

## \ud83d\udcc4 Arquivos modificados nesta sess\u00e3o (#3 \u2014 28/06/2026)

```
A  src/lib/schemas/caption.ts                    (Zod: captionRequestSchema, captionFormSchema, CAPTION_TONES)
M  src/lib/groq/client.ts                        (+ generateCaptions(count), + extractHashtags, variationHint)
M  src/app/api/caption/route.ts                  (skeleton -> real: Zod validation + GET healthcheck)
A  src/components/caption/CaptionGenerator.tsx   (gerador com 3 tons + bot\u00e3o 1 varia\u00e7\u00e3o + bot\u00e3o 3 varia\u00e7\u00f5es + hist\u00f3rico)
A  src/components/caption/CaptionEditor.tsx      (textarea edit\u00e1vel com contador Instagram 2200)
A  src/components/caption/CaptionActions.tsx     (bot\u00e3o Copiar + Limpar)
A  src/components/caption/DownloadButton.tsx     (fetch + blob + anchor, fallback window.open)
A  src/app/caption/page.tsx                      (nova p\u00e1gina: preview + generator + editor + actions + mensagem motivacional)
M  ROADMAP.md, STATE.md, .sdd-context            (Tela 5 marcada como DONE)
```

## \ud83d\udcc4 Arquivos modificados na sess\u00e3o #2 (28/06 \u2014 Tela 4 + VTON)

```
A  src/lib/cloudinary/parsePublicId.ts
M  src/lib/cloudinary/client.ts                  (+ buildComposedUrl, + encodeCloudinaryText)
A  src/lib/schemas/compose.ts
A  src/components/compose/ComposeForm.tsx
A  src/components/compose/ComposedPreview.tsx
M  src/app/compose/page.tsx                      (placeholder -> real)
M  src/app/api/compose/route.ts                  (skeleton -> real)
M  src/lib/huggingface/client.ts                 (callHFSpace PLACEHOLDER -> REAL com Gradio HTTP API)
```

## \ud83d\udcc4 Arquivos base (sess\u00e3o #1 \u2014 22/06)

```
(prisma, next.config, .sdd-context, AGENTS.md, db client, upload, config, generation, etc.)
~ 30 arquivos criados
```

---

## \ud83d\udcdd Contexto importante que N\u00c3O est\u00e1 no SPEC

- **tia usa Android Realme**, testar com 360x800 width
- **Wi-Fi da loja \u00e9 inst\u00e1vel** \u2014 sempre testar com e sem rede
- **tia prefere bot\u00f5es grandes** (\u226548px de altura, padding generoso)
- **Vercel Hobby em 2026 tem maxDuration 300s** (5 min)
- **Prisma 7+ mudou a API**: `prisma.config.ts` separado do schema, adapter expl\u00edcito (`@prisma/adapter-pg`)
- **HF Spaces (Gradio API)**: POST `/gradio_api/queue/join` + SSE polling em `/gradio_api/queue/data`
- **Next.js 16** (n\u00e3o 15 como o SPEC dizia) \u2014 `create-next-app@latest` j\u00e1 t\u00e1 no 16.2.9
- **`gradio_client`** foi removido \u2014 VTON vai via fetch HTTP direto
- **`capture="environment"`** no input file aciona c\u00e2mera traseira no mobile
- **Limite de 3 regen** na Tela 3 \u00e9 hardcoded (`MAX_REGENS` no `app/generate/page.tsx`)
- **Tag v0.X-<se\u00e7\u00e3o>** \u2014 conven\u00e7\u00e3o de versionamento
- **Cloudinary text overlay** \u2014 escape `,` `/` `:` `\\` no texto
- **Cloudinary free tier 2026**: 25 credits/m\u00eas = ~25k transforma\u00e7\u00f5es (sobra absurda pro MVP)
- **Groq Qwen3-32B** \u2014 modelo prim\u00e1rio, retorna em ~2-3s por chamada
- **`captionFormSchema`** \u2014 limite 2200 chars (limite do Instagram)
- **Download fallback** \u2014 iOS Safari bloqueia download program\u00e1tico; usa `window.open` + "long press"
- **Cerebras/OpenRouter fallback** \u2014 placeholder no `lib/groq/client.ts`, n\u00e3o implementado

---

## \ud83d\ude80 \u00daltima a\u00e7\u00e3o antes da pausa

Tela 5 (Legenda) implementada com Op\u00e7\u00e3o C h\u00edbrida:
- `GET /api/caption` \u2192 healthcheck
- `POST /api/caption` v\u00e1lido \u2192 gera N varia\u00e7\u00f5es via Groq Qwen3-32B
- `POST /api/caption` inv\u00e1lido \u2192 400 com Zod details
- `GET /caption` \u2192 200 p\u00e1gina renderiza
- Build: 13 rotas, 0 erros TS, 6 tags no git
- Push pra origin: main + tag v0.5-tela-4-composicao + tag v0.6-tela-5-legenda (em breve)

**Pr\u00f3xima sess\u00e3o: ler este STATE.md primeiro (1-2 min), depois Integra\u00e7\u00e3o E2E (valida\u00e7\u00e3o no navegador + mobile).**

---

## \ud83d\udc4d Como retomar (comando pro Iago)

Em outra sess\u00e3o / device, abrir o Mavis e digitar:

> "Continuar Brech\u00f3 na M\u00e3o. Estado em STATE.md. Pr\u00f3xima se\u00e7\u00e3o: Integra\u00e7\u00e3o E2E (valida\u00e7\u00e3o no navegador)."

A IA vai:
1. Ler `.sdd-context` (resumo imediato)
2. Ler `STATE.md` (detalhes + onde parei)
3. Ler `ROADMAP.md` (vis\u00e3o geral)
4. Ajudar o Iago a subir o dev server com `.env.local` real e validar cada tela no browser
5. Anotar bugs em `STATE.md` \u2192 "Bugs conhecidos"
6. Quando tudo OK, marcar E2E como DONE e seguir pra Deploy Vercel

---

*Pr\u00f3xima sess\u00e3o: ler este STATE.md primeiro (1-2 min), depois Integra\u00e7\u00e3o E2E.*