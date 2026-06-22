# Estado Atual — Brechó na Mão

**Última atualização:** 2026-06-22 16:45
**Sessão #:** 1
**Dispositivo:** Windows

---

## 🎯 Próximo passo imediato

**Tela 3 (Geração) — Implementar chamada ao VTON com polling e loading state**

Por quê: Tela 2 tá pronta e validada. Agora a gente chama o /api/tryon com a imageUrl, faz polling do status, e mostra o resultado.

Como fazer:
1. Criar hook `useTryOn()` em `src/lib/hooks/use-tryon.ts` (chama POST /api/tryon + GET polling)
2. Loading state com tempo estimado (~30-90s)
3. Preview da imagem gerada (vinda do Cloudinary)
4. Botão "Regerar" (até 3x) + "Avançar" (vai pra /compose)
5. Persistir `generatedImageUrl` no localStorage
6. Substituir placeholder em `src/app/generate/page.tsx`

Arquivos a criar/modificar:
- `src/lib/hooks/use-tryon.ts`
- `src/app/generate/page.tsx` (substituir placeholder)
- `src/components/generation/GeneratingState.tsx`
- `src/components/generation/GeneratedPreview.tsx`

Critérios de aceite (do SPEC):
- [ ] Loading state com tempo estimado
- [ ] Timeout de 60s com mensagem de erro
- [ ] Botão "Regerar" chama API novamente
- [ ] Limite de 3 regerações (com aviso)
- [ ] Imagem gerada em alta resolução
- [ ] Funciona offline depois de gerada (cache)

Por quê: o backend `/api/upload` está pronto e funcional (valida formato, tamanho, salva no Cloudinary). Falta o frontend que usa esse endpoint.

Como fazer:
1. Criar componente `<UploadZone />` em `src/components/upload/`
2. Aceitar JPG/PNG/WebP até 10MB
3. Preview da imagem após seleção
4. Botão "Continuar" só ativa após upload válido
5. Loading state durante upload
6. Persistir `imageUrl` retornado (localStorage ou state management)
7. Navegar pra `/config` no sucesso

Arquivos a criar/modificar:
- `src/app/(public)/page.tsx` (Tela 1 — Upload)
- `src/components/upload/UploadZone.tsx`
- `src/components/upload/UploadPreview.tsx`

Critérios de aceite (do SPEC):
- [ ] Aceita JPG, PNG, WebP até 10MB
- [ ] Mostra preview da imagem após seleção
- [ ] Valida tamanho e formato (client-side)
- [ ] Mensagem de erro clara se inválido
- [ ] Botão "Continuar" só ativa após upload válido
- [ ] Funciona com câmera nativa do mobile (`capture="environment"`)
- [ ] LGPD banner na primeira vez (consentimento de processamento de imagem)

---

## 📍 Onde parei

Tela 1 + Tela 2 completas e validadas. Smoke test passou em http://localhost:3000, /config, /generate.

Setup inicial completo. Stack escolhido e validado:
- Next.js 16.2.9 + React 19 + TypeScript + Tailwind 4
- Prisma 7 + Neon PostgreSQL
- API routes esqueleto criados (5 endpoints)
- Clientes lib/ criados (db, cloudinary, groq, huggingface)
- Documentação de contexto: `.sdd-context`, `STATE.md`, `ROADMAP.md`, `AGENTS.md`
- Tela 1 (Upload): drag&drop, preview, validação, LGPD banner, navegação pra /config
- Tela 2 (Config): form com tipo, tamanho (pills), preço (máscara R$), estilo, descrição
- Validação Zod com single source of truth (lib/schemas/config.ts)
- Persistência em localStorage entre telas
- Branch `feat/tela-2-config` mergeada na main com tag `v0.3-tela-2-config`

---

## 🐛 Bugs conhecidos

Nenhum ainda (código novo, não testado em produção).

---

## 💡 Decisões tomadas durante o desenvolvimento

1. **22/06**: **Vercel Hobby** em vez de Cloudflare (R$ 0/mês, DX superior, risco do TOS assumido)
2. **22/06**: **Plano B Cloudflare** documentado em `docs/PESQUISA-CLOUDFLARE-PLANO-B.md` caso Vercel reclame
3. **22/06**: **Prisma 7** detectado e adaptado (`prisma.config.ts` separado do schema)
4. **22/06**: **gradio_client removido** — não tem versão Node oficial. VTON via fetch HTTP direto pra API Gradio
5. **22/06**: **Branch renomeada** `master` → `main` (padrão GitHub)
6. **22/06**: **autocrlf** configurado (`true` no Windows) pra evitar warnings de CRLF
7. **22/06**: **Credenciais configuradas** — Cloudinary (`dmqqkv4ru`), Groq (`gsk_...`), Neon (sa-east-1, São Paulo)
8. **22/06**: **Migração Prisma aplicada** — 3 tabelas criadas no Neon (`Settings`, `Post`, `Generation`)
9. **22/06**: **Prisma 7 API corrigida** — `prisma.config.ts` usa helper `env()` + `dotenv/config`, separou schema de config
10. **22/06**: **Tela 2 (Config) implementada** — form com validação Zod, SizePills, máscara de preço, persistência localStorage
11. **22/06**: **schema/config.ts criado** — single source of truth pra tipos de roupa, tamanhos, estilos + parser de preço

---

## 📂 Arquivos modificados nesta sessão

```
A  prisma/schema.prisma                   (Settings, Post, Generation)
A  prisma.config.ts                        (Prisma 7+ config — helper env() + dotenv)
A  prisma/migrations/20260622181200_init/  (primeira migração aplicada no Neon)
A  .env.example                            (template de env vars)
A  .env                                    (Prisma CLI — DATABASE_URL)
A  .env.local                              (Next.js local — Cloudinary, Groq, Neon)
A  .sdd-context                            (resumo IA-first)
A  STATE.md                                (este arquivo)
A  ROADMAP.md                              (status das seções)
M  AGENTS.md                               (substituído pelo do projeto)
A  src/lib/db/prisma.ts                    (singleton + PrismaPg adapter)
A  src/lib/cloudinary/client.ts            (upload)
A  src/lib/groq/client.ts                  (LLM + fallback)
A  src/lib/huggingface/client.ts           (VTON + feature flag)
A  src/lib/utils.ts                        (cn, formatPrice, isValidUrl)
A  src/app/api/upload/route.ts             (Tela 1)
A  src/app/api/tryon/route.ts              (Tela 3, POST + GET)
A  src/app/api/caption/route.ts            (Tela 5)
A  src/app/api/compose/route.ts            (Tela 4)
A  src/app/api/settings/route.ts           (Configurações)
```

---

## 🔑 Contexto importante que NÃO está no SPEC

- **tia usa Android Realme**, testar com 360x800 width
- **Wi-Fi da loja é instável** — sempre testar com e sem rede
- **tia prefere botões grandes** (mínimo 48px de altura, padding generoso)
- **Vercel Hobby em 2026 tem maxDuration 300s** (5 min) — mudou do 10s antigo
- **Prisma 7+ mudou a API**: `prisma.config.ts` separado do schema, não usa mais `url` no `datasource`
- **HF Spaces**: client Python não roda em Node — precisa HTTP fetch direto pra API Gradio

---

## ⏸️ Última ação antes da pausa

Substituir AGENTS.md do template pelo do projeto + criar arquivos de contexto. Setup completo, **pronto para implementar Tela 1**.

---

*Próxima sessão: ler este STATE.md primeiro (1-2 min), depois começar Tela 1 (Upload).*
