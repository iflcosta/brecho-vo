# AGENTS.md — Regras de trabalho para IA no Brechó na Mão

> **Lido PRIMEIRO por qualquer agente/IA em nova sessão.**

## ⚠️ REGRA #0 — SEMPRE LER PRIMEIRO

Antes de fazer QUALQUER coisa, leia nesta ordem:

```
1. .sdd-context         (resumo mínimo)
2. STATE.md             (estado atual detalhado)
3. ROADMAP.md           (status de cada seção)
4. ../docs/SPEC-SDD.md  (apenas a seção atual em que estamos)
```

**Se algum desses faltar:** avise o usuário e sugira criá-lo.

---

## 📋 REGRAS DE TRABALHO

### Regra 1: Uma Seção Por Vez
- Nunca pule para próxima seção sem terminar a atual
- Nunca trabalhe em 2 seções simultaneamente
- Marque a seção como ✅ DONE no ROADMAP.md antes de avançar

### Regra 2: Atualize os Arquivos de Contexto
Após CADA mudança de código, atualize:
- ✅ `STATE.md` → "Próximo passo" e "Onde parei"
- ✅ `ROADMAP.md` → status da seção atual
- ✅ `git commit` com mensagem descritiva

### Regra 3: Mensagens de Commit Descritivas
```
<tipo>(<escopo>): <descrição curta>

- Detalhe 1
- Detalhe 2

Refs: SPEC-SDD.md#secao-X
```

Exemplos:
```
feat(tela-1): upload com preview e validação
fix(tela-3): timeout de 60s com HF Spaces públicos
chore(setup): Next.js 16 + Prisma 7 + Cloudinary + Groq
```

### Regra 4: Tags de Versão por Seção
Após completar uma seção:
```bash
git tag v0.1-setup
git tag v0.2-tela-1-upload
git tag v0.3-tela-2-config
```

### Regra 5: Referencie o SPEC no Código
Cada arquivo importante deve ter no topo:
```typescript
/**
 * @spec ../docs/SPEC-SDD.md#tela-1-upload
 * @description Componente de upload com preview
 */
```

### Regra 6: Não Mude o SPEC Sem Avisar
Se precisar mudar algo do SPEC:
1. PARE
2. Pergunte ao usuário: "Posso atualizar SPEC-SDD.md na seção X para fazer Y?"
3. Só mude após confirmação
4. Anote a mudança em STATE.md → "Decisões tomadas"

### Regra 7: Pergunte Antes de Decidir
Se uma decisão não está no SPEC e não é trivial:
- Pergunte ao usuário
- Documente em STATE.md
- Não assuma

---

## 🛑 PROTOCOLO DE PAUSA (Fim de Sessão)

Quando o usuário disser "vou parar", "até amanhã", "trocar de device":

```
1. ATUALIZE STATE.md com "Próximo passo imediato"
2. ATUALIZE ROADMAP.md com status atual
3. ATUALIZE .sdd-context (resumo IA-first)
4. FAÇA git commit com tudo que mudou
5. git tag v0.X-<seção> (se seção completa)
6. RESPONDA ao usuário com resumo do que foi feito
```

Template:
```
"Pronto! Pausa registrada.

✅ O que fiz: [resumo]
📁 Arquivos modificados: [lista]
📍 Estado atualizado em STATE.md, ROADMAP.md e .sdd-context
🎯 Próximo passo: [uma frase]

Quando voltar, é só me chamar com:
'Continuar Brechó na Mão. Estado em STATE.md. Próxima seção: [X]'

A IA vai ler .sdd-context, STATE.md, ROADMAP.md e seguir de onde parou."
```

---

## 🎯 CHECKLIST ANTES DE MARCAR SEÇÃO COMO ✅ DONE

- [ ] Todos os acceptance criteria da seção estão ✅
- [ ] Código testado manualmente
- [ ] Sem erros no console
- [ ] STATE.md atualizado
- [ ] ROADMAP.md atualizado
- [ ] Git commit feito
- [ ] Tag de versão criada
- [ ] `.sdd-context` atualizado se decisões mudaram

---

## 📂 ESTRUTURA DO PROJETO

```
brecho-na-mao/
├── .sdd-context              # Resumo IA-first
├── STATE.md                  # Estado vivo (atualizar sempre)
├── ROADMAP.md                # Status das seções
├── prisma/                   # Schema + migrations
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # 5 endpoints: upload, tryon, caption, compose, settings
│   │   └── (public)/         # Telas: page, config, generate, compose, caption
│   ├── components/           # Componentes reutilizáveis
│   ├── lib/                  # db, cloudinary, groq, huggingface, utils
│   └── styles/
└── ../docs/                  # Spec + research
```

---

## 💡 DICAS PRA IA

### O que FAZER
- ✅ Ler muito antes de escrever
- ✅ Começar simples, evoluir com feedback
- ✅ Commitar frequentemente
- ✅ Documentar decisões no STATE.md
- ✅ Testar no mobile (a tia usa Android Realme 360x800)

### O que NÃO fazer
- ❌ Inventar requisitos não presentes no SPEC
- ❌ Pular para próxima seção sem terminar a atual
- ❌ Esquecer de atualizar STATE.md
- ❌ Usar jargão sem explicar
- ❌ Adicionar dependências sem perguntar

---

## 🚨 EM CASO DE DÚVIDA

- Próximo passo → Leia STATE.md
- Escopo da seção atual → Leia `../docs/SPEC-SDD.md`
- Decisão não documentada → Pergunte ao usuário
- Bug novo → Anote em STATE.md → "Bugs conhecidos"

**Nunca assuma. Sempre pergunte ou verifique.**

---

*Criado em 2026-06-22 — Setup inicial do Brechó na Mão*
*Refs: `../docs/SPEC-SDD.md` (v2.1)*
