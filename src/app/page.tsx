/**
 * @spec docs/SPEC-SDD.md#tela-1-upload
 * @description Tela 1 (Upload) — PLACEHOLDER
 * @author Mavis
 *
 * Status: PLACEHOLDER (será implementado na próxima seção)
 * Refs: STATE.md → "Próximo passo imediato"
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">🛍️</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Brechó na Mão
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Tela 1 (Upload) — em construção
        </p>
        <div className="mt-8 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-left text-sm">
          <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-2">
            Setup inicial completo ✓
          </p>
          <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>✓ Next.js 16 + React 19 + TypeScript + Tailwind 4</li>
            <li>✓ Prisma 7 + schema (Settings, Post, Generation)</li>
            <li>✓ 5 API routes esqueleto (upload, tryon, caption, compose, settings)</li>
            <li>✓ Clientes: Cloudinary, Groq, HF Spaces</li>
            <li>✓ Contexto: .sdd-context, STATE.md, ROADMAP.md, AGENTS.md</li>
          </ul>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Próxima seção: Tela 1 (Upload com drag&drop)
        </p>
      </div>
    </main>
  );
}
