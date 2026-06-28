# Roadmap \u2014 Brech\u00f3 na M\u00e3o

| # | Se\u00e7\u00e3o | Status | In\u00edcio | Fim | Tag |
|---|---|---|---|---|---|
| 0 | Setup inicial (Next.js 16 + Prisma 7 + Cloudinary + Groq + HF Spaces) | \u2705 DONE | 22/06 | 22/06 | `v0.1-setup` |
| 1 | Tela 1: Upload (drag&drop + preview + valida\u00e7\u00e3o + LGPD banner) | \u2705 DONE | 22/06 | 22/06 | `v0.2-tela-1-upload` |
| 2 | Tela 2: Config (form: tipo, tamanho, pre\u00e7o, estilo, descri\u00e7\u00e3o) | \u2705 DONE | 22/06 | 22/06 | `v0.3-tela-2-config` |
| 3 | Tela 3: Gera\u00e7\u00e3o (VTON + loading + polling + limite 3 regen) | \u2705 DONE | 22/06 | 22/06 | `v0.4-tela-3-geracao` |
| 4 | Tela 4: Composi\u00e7\u00e3o (texto sobreposto: TAM, pre\u00e7o, hashtags) | \u2705 DONE | 28/06 | 28/06 | `v0.5-tela-4-composicao` |
| 5 | Tela 5: Legenda (gerar via Groq + edit + download) | \u2705 DONE | 28/06 | 28/06 | `v0.6-tela-5-legenda` |
| 6 | Integra\u00e7\u00e3o E2E (setup: error boundaries + Playwright + checklist) | \ud83d\udea2 IN PROGRESS | 28/06 | - | `v0.7-integracao-e2e` |
| 7 | Deploy Vercel + smoke test no mobile | \u23f3 PENDING | - | - | - |

## Progresso: **6/8 se\u00e7\u00f5es completas (75%)** (E2E em valida\u00e7\u00e3o manual)

## Legenda
- \u2705 DONE
- \ud83d\udea2 IN PROGRESS
- \u23f3 PENDING
- \ud83d\udeab BLOCKED (com motivo)

---

## Resumo por se\u00e7\u00e3o

### \u2705 Tela 1 (Upload) \u2014 `v0.2-tela-1-upload`
- Drag&drop + tap pra selecionar
- C\u00e2mera nativa do mobile (`capture="environment"`)
- Valida\u00e7\u00e3o client-side: JPG/PNG/WebP at\u00e9 10MB
- Preview + bot\u00e3o "Trocar foto"
- LGPD banner persistente em localStorage
- Upload via `/api/upload` (Cloudinary)
- Navega pra `/config` em sucesso

### \u2705 Tela 2 (Config) \u2014 `v0.3-tela-2-config`
- Form com 5 campos (tipo, tamanho, pre\u00e7o, estilo, descri\u00e7\u00e3o)
- Valida\u00e7\u00e3o Zod (`productConfigFormSchema`)
- SizePills PP/P/M/G/GG com `role="radiogroup"`
- M\u00e1scara de pre\u00e7o R$ com preview em tempo real
- Header sticky com thumbnail da imagem
- Persist\u00eancia localStorage
- Navega pra `/generate` em sucesso

### \u2705 Tela 3 (Gera\u00e7\u00e3o) \u2014 `v0.4-tela-3-geracao`
- Hook `useTryOn` com state machine (idle \u2192 submitting \u2192 polling \u2192 done/failed)
- POST `/api/tryon` fire-and-forget + GET polling a cada 3s
- Timeout de 90s (VTON 30-90s + folga)
- Loading state com tempo estimado + barra de progresso
- Limite de 3 regera\u00e7\u00f5es
- Erro amig\u00e1vel com retry
- **`callHFSpace()` REAL** (Gradio HTTP API)
  - Primary: Kwai-Kolors/Kolors-Virtual-Try-On
  - Fallback: HumanAIGC/OutfitAnyone \u2192 levihsu/OOTDiffusion

### \u2705 Tela 4 (Composi\u00e7\u00e3o) \u2014 `v0.5-tela-4-composicao`
- **Cloudinary server-side overlay** (3 layers verticais no rodap\u00e9)
  - Layer 1 (TAM): fonte 80, bold
  - Layer 2 (Pre\u00e7o): fonte 70, bold
  - Layer 3 (Rodap\u00e9): fonte 36, hashtags + @loja
- Posi\u00e7\u00f5es: rodap\u00e9 (default), topo, rodap\u00e9 direito
- Auto-preview com debounce 400ms
- Form com SizePills, pre\u00e7o, hashtags, @loja
- Estado vazio: redirect pra `/generate` se falta imagem
- localStorage: `brecho-final-image`
- Navega pra `/caption` em sucesso

### \u2705 Tela 5 (Legenda) \u2014 `v0.6-tela-5-legenda`
- **Op\u00e7\u00e3o C h\u00edbrida** (decis\u00e3o 28/06): 1 legenda inicial + bot\u00e3o "Gerar outra" + "Gerar 3 varia\u00e7\u00f5es"
- Tom da legenda: casual / elegante / divertido (sele\u00e7\u00e3o visual)
- Editor: textarea edit\u00e1vel com contador Instagram (limite 2200 chars)
- Download da imagem: fetch + blob + anchor (fallback: nova aba)
- Copiar legenda: `navigator.clipboard.writeText` (fallback: execCommand)
- Mensagem motivacional "Pronto pra postar! \ud83d\ude680" ao finalizar
- Bot\u00e3o "Fazer outro post" limpa localStorage e volta pra `/`
- Valida\u00e7\u00e3o Zod (`captionRequestSchema` + `captionFormSchema`)
- Smoke test: build OK (13 rotas, 0 erros TS)

### \ud83d\udea2 Integra\u00e7\u00e3o E2E \u2014 em valida\u00e7\u00e3o (28/06)
- **Setup completo:**
  - `src/app/error.tsx` + `global-error.tsx` \u2014 error boundaries
  - `src/app/not-found.tsx` \u2014 404 amig\u00e1vel
  - `src/app/layout.tsx` \u2014 Toaster global (sonner) + metadata + viewport
  - `playwright.config.ts` \u2014 mobile-first (Pixel 5 + Desktop Chrome)
  - `tests/e2e/navigation.spec.ts` \u2014 7 testes (5 telas + 404 + bot\u00e3o voltar)
  - `tests/e2e/api.spec.ts` \u2014 8 testes (GET healthchecks + POST valida\u00e7\u00f5es Zod)
  - `docs/E2E-CHECKLIST.md` \u2014 checklist detalhado pra Iago (5 telas + cross-cutting + A11y)
- **Valida\u00e7\u00e3o manual:** Iago precisa testar no device de origem com `.env.local` real
- **Pr\u00f3ximo:** rodar Playwright (`npm run test:e2e:install && npm run test:e2e`) + validar cada tela no navegador
- **Smoke test:** build OK (13 rotas, 0 warnings TS)

### \u23f3 Deploy Vercel \u2014 final
- Configurar env vars no Vercel Dashboard
- Push do repo (j\u00e1 feito)
- Smoke test em produ\u00e7\u00e3o
- Testar dom\u00ednio custom (opcional)

---

\u00daltima atualiza\u00e7\u00e3o: 2026-06-28 15:20