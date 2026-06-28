/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Helpers pra extrair publicId e version de URLs do Cloudinary.
 * @author Mavis
 *
 * URL típica do Cloudinary:
 *   https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/<public_id>.<format>
 *
 * Precisamos extrair publicId (sem extensão) + version pra montar
 * URLs de transformação server-side (l_text overlay).
 */

/**
 * Extrai { publicId, version, format } de uma secure_url do Cloudinary.
 * Se a URL não bater com o padrão, retorna null.
 */
export function parseCloudinaryUrl(
  url: string
): { publicId: string; version: number; format: string } | null {
  if (!url) return null;

  try {
    // Padrão: /image/upload/v<version>/<public_id>.<format>
    // ou:     /image/upload/<public_id>.<format> (sem version)
    const match = url.match(
      /\/image\/upload\/(?:v(\d+)\/)?(.+?)(?:\.(jpe?g|png|webp))?$/i
    );
    if (!match) return null;

    const version = match[1] ? Number(match[1]) : 0;
    const publicId = match[2];
    const format = match[3] ?? "jpg";

    return { publicId, version, format };
  } catch {
    return null;
  }
}

/**
 * Verifica se a URL é do Cloudinary (heurística simples).
 */
export function isCloudinaryUrl(url: string): boolean {
  return /res\.cloudinary\.com\//i.test(url);
}