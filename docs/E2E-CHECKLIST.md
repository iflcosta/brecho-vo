# Checklist de Integração E2E — Brechó na Mão

> **Objetivo:** Validar o fluxo completo Upload → Download no navegador + mobile, antes do Deploy Vercel.
>
> **Quem roda:** Iago (no device de origem com `.env.local` real)
>
> **Pré-requisito:** `npm install && npm run dev` rodando em `http://localhost:3000`

---

## 🛠️ Setup antes de testar

```bash
# 1. Confirmar que .env.local existe com todas as vars
cat .env.local  # deve ter DATABASE_URL, CLOUDINARY_*, GROQ_API_KEY, HF_TOKEN

# 2. Subir dev server
npm run dev
# Esperado: "Ready in ~Xms" + "http://localhost:3000"

# 3. Abrir DevTools do browser
# - View > Developer > Developer Tools
# - Mobile mode: Cmd+Shift+M (Chrome) / Toggle Device Toolbar
# - Selecionar "Realme 6" ou preset 360x800

# 4. Limpar localStorage antes de testar
# Application > Storage > Clear site data
```

---

## 📱 Cenários por tela

### Tela 1 — Upload (`/`)

**Setup:** localStorage limpo, aba anônima (ou cookies limpos)

| # | Cenário | Esperado | Bug? |
|---|---|---|---|
| 1.1 | Abrir `/` pela primeira vez | LGPD banner aparece embaixo | [ ] |
| 1.2 | Clicar "Entendi, pode continuar" | Banner desaparece, localStorage `brecho-lgpd-consent-v1=true` | [ ] |
| 1.3 | Recarregar a página (`F5`) | Banner NÃO aparece (já aceitou) | [ ] |
| 1.4 | Limpar localStorage e recarregar | Banner aparece de novo | [ ] |
| 1.5 | Tap no botão "Escolher foto" (mobile) | Abre seletor de arquivos OU câmera (devido a `capture="environment"`) | [ ] |
| 1.6 | Selecionar JPG válido (<10MB) | Preview aparece + botão "Continuar" | [ ] |
| 1.7 | Selecionar PNG grande (8MB) | Preview aparece | [ ] |
| 1.8 | Tentar arquivo de 15MB | Erro amigável "Arquivo muito grande (max 10MB)" | [ ] |
| 1.9 | Tentar PDF | Erro "Tipo não suportado" | [ ] |
| 1.10 | Clicar "Continuar" | Spinner + toast "Foto enviada!" + navega pra `/config` | [ ] |
| 1.11 | Cortar internet no meio do upload | Erro amigável + botão "Continuar" reativado | [ ] |
| 1.12 | Verificar `brecho-original-image` no localStorage | Tem URL do Cloudinary | [ ] |

**Erros comuns a observar:**
- Banner LGPD com flash inicial (renderiza null → false)
- Preview de blob não libera quando trocar de arquivo (memory leak)
- Toast não aparece (Toaster não está em layout global)

---

### Tela 2 — Config (`/config`)

**Setup:** Ter concluído Tela 1 (localStorage com `brecho-original-image`)

| # | Cenário | Esperado | Bug? |
|---|---|---|---|
| 2.1 | Abrir `/config` direto (sem Tela 1) | Estado vazio OU redirect pra `/` | [ ] |
| 2.2 | Ver header com thumbnail da foto | Imagem pequena no canto | [ ] |
| 2.3 | Preencher tipo, TAM, preço | Campos aceitam valores | [ ] |
| 2.4 | Digitar preço "1234" | Formata pra "R$ 12,34" no preview | [ ] |
| 2.5 | Selecionar TAM = "M" | Pill fica destacado (cor rosa) | [ ] |
| 2.6 | Deixar preço vazio e tentar avançar | Validação Zod bloqueia + mensagem | [ ] |
| 2.7 | Clicar "Avançar" com tudo preenchido | Persiste localStorage + navega `/generate` | [ ] |
| 2.8 | Recarregar `/config` | Form vem preenchido com valores anteriores | [ ] |
| 2.9 | Voltar pra `/` e avançar de novo | localStorage preserva | [ ] |

---

### Tela 3 — Geração (`/generate`)

**Setup:** Ter concluído Tela 2 (localStorage com `brecho-product-config-v1`)

| # | Cenário | Esperado | Bug? |
|---|---|---|---|
| 3.1 | Abrir `/generate` | Auto-inicia POST /api/tryon | [ ] |
| 3.2 | Loading aparece | Spinner + texto "Gerando modelo virtual..." + tempo estimado | [ ] |
| 3.3 | Polling a cada 3s | Console mostra GET /api/tryon?id=... | [ ] |
| 3.4 | VTON demora 30-60s | Loading continua, mensagem atualiza | [ ] |
| 3.5 | VTON termina com sucesso | Preview da imagem gerada aparece | [ ] |
| 3.6 | `brecho-generated-image` no localStorage | URL do Cloudinary (ou HF Space output) | [ ] |
| 3.7 | Clicar "Avançar" | Navega pra `/compose` | [ ] |
| 3.8 | Clicar "🔄 Regenerar" | Cria nova generation, loading recomeça | [ ] |
| 3.9 | Regenerar 3 vezes | 4ª tentativa bloqueada OU mensagem "limite atingido" | [ ] |
| 3.10 | VTON falha (Space offline) | Fallback tenta próximo Space (até 3) | [ ] |
| 3.11 | Todos os Spaces falham | Mensagem amigável + botão "Tentar novamente" | [ ] |
| 3.12 | Timeout de 90s | Mensagem "Demorou demais, tenta de novo" | [ ] |

**Erros comuns a observar:**
- VTON retorna imagem original (placeholder ainda presente? ver `lib/huggingface/client.ts`)
- Loop infinito de polling se status nunca termina
- Memory leak do timer (verificar cleanup no unmount)

---

### Tela 4 — Composição (`/compose`)

**Setup:** Ter concluído Tela 3 (localStorage com `brecho-generated-image`)

| # | Cenário | Esperado | Bug? |
|---|---|---|---|
| 4.1 | Abrir `/compose` | Mostra imagem gerada + form | [ ] |
| 4.2 | TAM padrão = mesmo da Tela 2 | Pill já marcado | [ ] |
| 4.3 | Preço padrão = mesmo da Tela 2 | Campo preenchido | [ ] |
| 4.4 | Auto-preview com debounce 400ms | Imagem atualiza ao digitar | [ ] |
| 4.5 | Mudar TAM de "M" pra "G" | Imagem recompõe com novo texto | [ ] |
| 4.6 | Adicionar hashtag "#vintage" | Aparece no rodapé da imagem | [ ] |
| 4.7 | Adicionar @loja "@brecho.mano" | Aparece no rodapé | [ ] |
| 4.8 | Posição = "Topo" | Texto vai pro topo | [ ] |
| 4.9 | Posição = "Rodapé direito" | Texto canto inferior direito | [ ] |
| 4.10 | Clicar "Avançar" | Persiste `brecho-final-image` + navega `/caption` | [ ] |
| 4.11 | URL composta abre no Cloudinary | Texto sobreposto renderiza corretamente | [ ] |
| 4.12 | Caracteres especiais (R$, vírgula) | Renderiza sem quebrar o layer | [ ] |

**Erros comuns a observar:**
- Texto cortado (TAM fonte muito grande)
- Texto sobreposto em cima do manequim (cor/contraste ruim)
- Hashtags/@ com caracteres especiais quebram o layer do Cloudinary
- Posição "topo" não funciona (`g_north` no Cloudinary)

---

### Tela 5 — Legenda (`/caption`)

**Setup:** Ter concluído Tela 4 (localStorage com `brecho-final-image`)

| # | Cenário | Esperado | Bug? |
|---|---|---|---|
| 5.1 | Abrir `/caption` | Mostra preview da imagem final + tom selector | [ ] |
| 5.2 | Selecionar tom "Elegante" | Pill muda de cor | [ ] |
| 5.3 | Clicar "Gerar legenda" | Loading ~2-3s + legenda aparece no textarea | [ ] |
| 5.4 | Clicar "Gerar outra" | Nova variação substitui | [ ] |
| 5.5 | Clicar "Gerar 3 variações" | 3 chamadas em paralelo + histórico aparece | [ ] |
| 5.6 | Clicar em variação antiga no histórico | Textarea atualiza | [ ] |
| 5.7 | Editar legenda manualmente | Textarea aceita edição | [ ] |
| 5.8 | Passar de 2200 chars | Contador fica vermelho + warning | [ ] |
| 5.9 | Clicar "Copiar" | Toast "Copiado!" + texto no clipboard | [ ] |
| 5.10 | Clicar "Baixar imagem" | Arquivo `brecho-post.jpg` é baixado | [ ] |
| 5.11 | Mobile iOS Safari (sem fetch blob) | Fallback: abre imagem em nova aba + instrução "long press" | [ ] |
| 5.12 | Clicar "✓ Marcar como pronto" | Mensagem motivacional aparece + "Fazer outro post" | [ ] |
| 5.13 | Clicar "Fazer outro post" | Limpa localStorage + volta pra `/` | [ ] |
| 5.14 | Verificar mensagem motivacional | "Pronto pra postar! 🚀" com botão de refazer | [ ] |

**Erros comuns a observar:**
- Groq demora >10s (rate limit?)
- Legenda muito longa (>2200)
- Download bloqueado por CORS no Cloudinary (fallback funciona?)
- iOS Safari não baixa arquivo (fallback window.open funciona?)

---

## 🔁 Fluxo completo (happy path)

| # | Ação | Resultado esperado |
|---|---|---|
| F.1 | Abrir `/` em aba anônima | LGPD banner |
| F.2 | Aceitar LGPD + selecionar foto JPG | Preview + Continuar |
| F.3 | Continuar → /config | Form vazio |
| F.4 | Preencher (Vestido, M, R$ 45, Casual) + Avançar | /generate inicia |
| F.5 | Esperar VTON (~60s) | Imagem gerada |
| F.6 | Avançar → /compose | Preview + form |
| F.7 | Manter config padrão + Avançar | Imagem composta |
| F.8 | /caption → Gerar legenda | Legenda em ~3s |
| F.9 | Editar se quiser + Copiar | Clipboard |
| F.10 | Baixar imagem | JPG no /downloads |
| F.11 | Abrir imagem | Foto com TAM + preço + hashtags |
| F.12 | Colar legenda no Instagram | Post pronto |

**Tempo total esperado:** ~90s (VTON domina) + ~10s para o resto = ~100s

---

## 🐛 Bugs pra anotar (template)

Quando achar um bug, anote em `STATE.md > Bugs conhecidos` no formato:

```markdown
- **[Tela N] descrição curta** — quando acontece, comportamento atual vs esperado
  - Como reproduzir: ...
  - Severidade: blocker | major | minor | cosmetic
  - Workaround: ...
```

Exemplos:
```markdown
- **[Tela 3] VTON retorna imagem original** — quando chama Kolors-VTON, retorna input ao invés de output
  - Como reproduzir: usar foto de manequim e esperar geração
  - Severidade: blocker (tela 3 fica inútil sem VTON real)
  - Workaround: usar FASHN API (pago)

- **[Tela 4] Texto TAM sobreposto na cabeça do manequim** — quando posição é "rodapé direito"
  - Como reproduzir: foto de manequim de corpo inteiro
  - Severidade: major (afeta UX do post)
  - Workaround: usar posição "rodapé" centralizado
```

---

## 🌐 Cross-cutting (mobile-first)

| # | Teste | Esperado |
|---|---|---|
| C.1 | Viewport 360x800 (Android Realme) | Tudo cabe sem scroll horizontal |
| C.2 | Botões ≥48px de altura | Tap-friendly |
| C.3 | Tap em link (não em texto) | Navega |
| C.4 | Teclado virtual aparece (inputs) | Não quebra layout |
| C.5 | Rotação portrait → landscape | Layout adapta (não precisa ser perfeito) |
| C.6 | Modo dark do sistema | App renderiza dark |
| C.7 | Wi-Fi da loja instável | Não trava (timeout gracioso) |
| C.8 | Recarregar no meio do fluxo | localStorage preserva estado |
| C.9 | Voltar 1 tela (botão ←) | Não perde estado |
| C.10 | Console do browser | Sem erros vermelhos |

---

## ♿ Acessibilidade (axe-core)

| # | Teste | Esperado |
|---|---|---|
| A.1 | Navegação por teclado (Tab) | Foco visível em todos os botões |
| A.2 | Screen reader (NVDA/VoiceOver) | Anuncia papel + label dos elementos |
| A.3 | Contraste de cores | ≥4.5:1 (texto normal) |
| A.4 | Botões com `aria-label` | Ícones puros são anunciados |
| A.5 | Forms com `<label for="...">` | Cada input tem label |
| A.6 | `role="radiogroup"` nos pills | Anunciado como grupo |
| A.7 | `aria-live` em mensagens dinâmicas | Toast/motivacional anunciado |

---

## ✅ Critérios de aceite da Integração E2E

- [ ] Fluxo F.1 → F.12 funciona end-to-end em <2min
- [ ] Todos os cenários "Esperado" das 5 telas passam
- [ ] Zero erros vermelhos no console do browser
- [ ] Mobile (360x800) renderiza sem scroll horizontal
- [ ] LGPD banner aparece 1x e não volta
- [ ] localStorage persiste entre navegações
- [ ] Pelo menos 3 peças diferentes testadas (variação de fotos)
- [ ] Bugs encontrados anotados em STATE.md

**Quando todos ✅:** marcar Seção 6 como DONE e seguir pra Seção 7 (Deploy Vercel).