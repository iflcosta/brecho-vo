# Roadmap \u2014 Brech\u00f3 na M\u00e3o

| # | Se\u00e7\u00e3o | Status | In\u00edcio | Fim | Tag |
|---|---|---|---|---|---|
| 0 | Setup inicial (Next.js 16 + Prisma 7 + Cloudinary + Groq + HF Spaces) | \u2705 DONE | 22/06 | 22/06 | `v0.1-setup` |
| 1 | Tela 1: Upload (drag&drop + preview + valida\u00e7\u00e3o + LGPD banner) | \u2705 DONE | 22/06 | 22/06 | `v0.2-tela-1-upload` |
| 2 | Tela 2: Config (form: tipo, tamanho, pre\u00e7o, estilo, descri\u00e7\u00e3o) | \u2705 DONE | 22/06 | 22/06 | `v0.3-tela-2-config` |
| 3 | Tela 3: Gera\u00e7\u00e3o (VTON + loading + polling + limite 3 regen) | \u2705 DONE | 22/06 | 22/06 | `v0.4-tela-3-geracao` |
| 4 | Tela 4: Composi\u00e7\u00e3o (texto sobreposto: TAM, pre\u00e7o, hashtags) | \u2705 DONE | 28/06 | 28/06 | `v0.5-tela-4-composicao` |
| 5 | Tela 5: Legenda (gerar via Groq + edit + download) | \u23f3 PENDING | - | - | - |
| 6 | Integra\u00e7\u00e3o E2E (fluxo completo Upload \u2192 Download) | \u23f3 PENDING | - | - | - |
| 7 | Deploy Vercel + smoke test no mobile | \u23f3 PENDING | - | - | - |

## Progresso: **5/8 se\u00e7\u00f5es completas (62%)**

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
- Smoke test: `GET /` \u2192 200, `POST /api/upload` sem file \u2192 400

### \u2705 Tela 2 (Config) \u2014 `v0.3-tela-2-config`
- Form com 5 campos (tipo, tamanho, pre\u00e7o, estilo, descri\u00e7\u00e3o)
- Valida\u00e7\u00e3o Zod (`productConfigFormSchema` em `lib/schemas/config.ts`)
- SizePills PP/P/M/G/GG com `role="radiogroup"`
- M\u00e1scara de pre\u00e7o R$ com preview em tempo real
- Header sticky com thumbnail da imagem
- Persist\u00eancia localStorage
- Navega pra `/generate` em sucesso
- Smoke test: `GET /config` \u2192 200

### \u2705 Tela 3 (Gera\u00e7\u00e3o) \u2014 `v0.4-tela-3-geracao`
- Hook `useTryOn` com state machine (idle \u2192 submitting \u2192 polling \u2192 done/failed)
- POST `/api/tryon` fire-and-forget + GET polling a cada 3s
- Timeout de 90s (VTON 30-90s + folga)
- Loading state com tempo estimado (~30-90s) + barra de progresso
- Limite de 3 regera\u00e7\u00f5es com aviso
- Erro amig\u00e1vel com op\u00e7\u00e3o de tentar novamente
- Auto-start quando chega na p\u00e1gina
- **AGORA REAL:** `callHFSpace()` usa fetch HTTP pra API Gradio do Space
  - Primary: Kwai-Kolors/Kolors-Virtual-Try-On
  - Fallback: HumanAIGC/OutfitAnyone \u2192 levihsu/OOTDiffusion
- Smoke test: `GET /generate` \u2192 200, `GET /api/tryon` sem id \u2192 400

### \u2705 Tela 4 (Composi\u00e7\u00e3o) \u2014 `v0.5-tela-4-composicao`
- **Cloudinary server-side overlay** (Opção B escolhida 28/06)
- 3 layers verticais no rodap\u00e9:
  - Layer 1 (TAM): fonte 80, bold, fundo preto 60%
  - Layer 2 (Pre\u00e7o): fonte 70, bold, fundo preto 60%
  - Layer 3 (Rodap\u00e9): fonte 36, fundo preto 50%
- Posi\u00e7\u00f5es: rodap\u00e9 (default), topo, rodap\u00e9 direito
- Auto-preview com debounce 400ms (form \u2192 /api/compose)
- Form com SizePills TAM, pre\u00e7o (R$ 45,00), hashtags, @loja
- Estado vazio: redirect pra `/generate` se n\u00e3o tem imagem gerada
- localStorage: `brecho-final-image` (URL composta)
- Navega pra `/caption` em sucesso
- Smoke test: `GET /api/compose` \u2192 200, `POST /api/compose` v\u00e1lido \u2192 200 com composedUrl, inv\u00e1lido \u2192 400, `GET /compose` \u2192 200

### \u23f3 Tela 5 (Legenda) \u2014 pr\u00f3xima
- Chamar `/api/caption` (Groq Qwen3-32B)
- Edit inline da legenda sugerida
- Download da imagem final (com texto + foto)
- Mensagem motivacional sobre pr\u00f3xima fase (postagem autom\u00e1tica)

### \u23f3 Integra\u00e7\u00e3o E2E \u2014 depois
- Validar fluxo completo: Upload \u2192 Download
- Testar em mobile (Safari + Chrome Android)
- Acessibilidade (axe-core)
- LGPD compliance

### \u23f3 Deploy Vercel \u2014 final
- Configurar env vars no Vercel Dashboard
- Push do repo
- Smoke test em produ\u00e7\u00e3o
- Testar dom\u00ednio custom (opcional)

---

\u00daltima atualiza\u00e7\u00e3o: 2026-06-28 14:18