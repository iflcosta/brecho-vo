# Roadmap — Brechó na Mão

| # | Seção | Status | Início | Fim | Tag |
|---|---|---|---|---|---|
| 0 | Setup inicial (Next.js 16 + Prisma 7 + Cloudinary + Groq + HF Spaces) | ✅ DONE | 22/06 | 22/06 | `v0.1-setup` |
| 1 | Tela 1: Upload (drag&drop + preview + validação + LGPD banner) | ✅ DONE | 22/06 | 22/06 | `v0.2-tela-1-upload` |
| 2 | Tela 2: Config (form: tipo, tamanho, preço, estilo, descrição) | ✅ DONE | 22/06 | 22/06 | `v0.3-tela-2-config` |
| 3 | Tela 3: Geração (VTON + loading + polling + limite 3 regen) | ✅ DONE | 22/06 | 22/06 | `v0.4-tela-3-geracao` |
| 4 | Tela 4: Composição (texto sobreposto: TAM, preço, hashtags) | ⏳ PENDING | - | - | - |
| 5 | Tela 5: Legenda (gerar via Groq + edit + download) | ⏳ PENDING | - | - | - |
| 6 | Integração E2E (fluxo completo Upload → Download) | ⏳ PENDING | - | - | - |
| 7 | Deploy Vercel + smoke test no mobile | ⏳ PENDING | - | - | - |

## Progresso: **4/8 seções completas (50%)**

## Legenda
- ✅ DONE
- 🔄 IN PROGRESS
- ⏳ PENDING
- ❌ BLOCKED (com motivo)

---

## Resumo por seção

### ✅ Tela 1 (Upload) — `v0.2-tela-1-upload`
- Drag&drop + tap pra selecionar
- Câmera nativa do mobile (`capture="environment"`)
- Validação client-side: JPG/PNG/WebP até 10MB
- Preview + botão "Trocar foto"
- LGPD banner persistente em localStorage
- Upload via `/api/upload` (Cloudinary)
- Navega pra `/config` em sucesso
- Smoke test: `GET /` → 200, `POST /api/upload` sem file → 400

### ✅ Tela 2 (Config) — `v0.3-tela-2-config`
- Form com 5 campos (tipo, tamanho, preço, estilo, descrição)
- Validação Zod (`productConfigFormSchema` em `lib/schemas/config.ts`)
- SizePills PP/P/M/G/GG com `role="radiogroup"`
- Máscara de preço R$ com preview em tempo real
- Header sticky com thumbnail da imagem
- Persistência localStorage
- Navega pra `/generate` em sucesso
- Smoke test: `GET /config` → 200

### ✅ Tela 3 (Geração) — `v0.4-tela-3-geracao`
- Hook `useTryOn` com state machine (idle → submitting → polling → done/failed)
- POST `/api/tryon` fire-and-forget + GET polling a cada 3s
- Timeout de 90s (VTON 30-90s + folga)
- Loading state com tempo estimado (~30-90s) + barra de progresso
- Limite de 3 regerações com aviso
- Erro amigável com opção de tentar novamente
- Auto-start quando chega na página
- **Limitação:** `callHFSpace()` ainda é placeholder (retorna imagem original) — a fazer
- Smoke test: `GET /generate` → 200, `GET /api/tryon` sem id → 400

### ⏳ Tela 4 (Composição) — próxima
- Renderizar texto sobreposto na imagem gerada
- TAM: M, R$ 45,00, #brechó, @loja
- Decisão técnica pendente: Canvas (client) vs Cloudinary (server)
- Persistir `finalImageUrl` (dataURL ou URL do Cloudinary) no localStorage
- Navega pra `/caption` (Tela 5)

### ⏳ Tela 5 (Legenda) — depois
- Chamar `/api/caption` (Groq Qwen3-32B)
- Edit inline da legenda sugerida
- Download da imagem final (com texto + foto)
- Mensagem motivacional sobre próxima fase (postagem automática)

### ⏳ Integração E2E — depois
- Validar fluxo completo: Upload → Download
- Testar em mobile (Safari + Chrome Android)
- Acessibilidade (axe-core)
- LGPD compliance

### ⏳ Deploy Vercel — final
- Configurar env vars no Vercel Dashboard
- Push do repo
- Smoke test em produção
- Testar domínio custom (opcional)

---

## Última atualização: 2026-06-22 17:25
