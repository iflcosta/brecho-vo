/**
 * @spec docs/SPEC-SDD.md#integracao-e2e
 * @description Página 404 amigável.
 * @author Mavis
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl">🧐</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Página não encontrada
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Esse endereço não existe (ou foi desconectado). Volta pro começo pra
          continuar criando seu post.
        </p>

        <Link
          href="/"
          className="inline-block min-h-[48px] px-6 leading-[48px] rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-colors"
        >
          ← Voltar pro começo
        </Link>
      </div>
    </main>
  );
}