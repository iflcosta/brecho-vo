/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Cliente Cloudinary para upload e composição de imagens.
 * @author Mavis
 *
 * Funções:
 *  - uploadImage(): upload de dataURL/URL externa
 *  - buildComposedUrl(): monta URL com text overlay (Tela 4)
 */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Faz upload de uma imagem (base64 data URL ou URL externa) e retorna a URL pública.
 * @param file - data URL (data:image/...) ou URL HTTP
 * @param folder - pasta dentro do Cloudinary (default: "brecho/posts")
 */
export async function uploadImage(
  file: string,
  folder: string = "brecho/posts"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Opções de composição de texto.
 */
export type ComposeTextOptions = {
  /** TAM (tamanho da roupa): "PP", "P", "M", "G", "GG" */
  size: string;
  /** Preço já formatado: "R$ 45,00" */
  price: string;
  /** Hashtags: "#brecho #modasusada" */
  hashtags?: string;
  /** Handle do Instagram: "@brecho.mano" */
  instagramHandle?: string;
  /** Posição do bloco: bottom | top | bottom_right */
  position?: "bottom" | "top" | "bottom_right";
};

/**
 * Monta URL do Cloudinary com overlays de texto (TAM, preço, hashtags, @).
 *
 * Estratégia: 3 layers verticais no rodapé.
 *  - Layer 1 (TAM): fonte 80, bold, fundo preto 60%
 *  - Layer 2 (Preço): fonte 70, bold, fundo preto 60%
 *  - Layer 3 (Rodapé): fonte 36, fundo preto 50%
 *
 * Cada layer usa gravity "south" e y offset pra empilhar.
 *
 * Refs: https://cloudinary.com/documentation/image_transformations#adding_text_overlays
 */
export function buildComposedUrl(
  publicId: string,
  version: number,
  opts: ComposeTextOptions
): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME não configurado");
  }

  const position = opts.position ?? "bottom";
  // gravity: south (rodapé centralizado) | north (topo) | south_east (rodapé direito)
  const gravity =
    position === "top"
      ? "north"
      : position === "bottom_right"
      ? "south_east"
      : "south";

  // Cada layer do Cloudinary é separado por "/".
  // Formato: l_<source>:<source_value>,<text_transform>,<position>
  // Ex: l_text:Arial_80_bold:TAM%20M,co_white,b_rgb:00000099,g_south,y_200

  const layers: string[] = [];

  // Layer 1 — TAM (size) — maior destaque
  layers.push(
    buildTextLayer(`TAM ${opts.size}`, {
      fontSize: 80,
      fontWeight: "bold",
      bgOpacity: "99",
      gravity,
      yOffset: 200,
    })
  );

  // Layer 2 — Preço
  layers.push(
    buildTextLayer(opts.price, {
      fontSize: 70,
      fontWeight: "bold",
      bgOpacity: "99",
      gravity,
      yOffset: 110,
    })
  );

  // Layer 3 — Hashtags + @ (só se houver)
  const footer = [opts.hashtags, opts.instagramHandle].filter(Boolean).join("  ");
  if (footer) {
    layers.push(
      buildTextLayer(footer, {
        fontSize: 36,
        fontWeight: "normal",
        bgOpacity: "88",
        gravity,
        yOffset: 30,
      })
    );
  }

  const versionPart = version > 0 ? `v${version}/` : "";
  const url = `https://res.cloudinary.com/${cloudName}/image/upload/${layers.join(
    "/"
  )}/${versionPart}${publicId}.jpg`;

  return url;
}

/**
 * Helper interno: monta 1 layer de texto do Cloudinary.
 */
function buildTextLayer(
  text: string,
  opts: {
    fontSize: number;
    fontWeight: "bold" | "normal";
    bgOpacity: string;
    gravity: "north" | "south" | "south_east";
    yOffset: number;
  }
): string {
  const encodedText = encodeCloudinaryText(text);
  const parts = [
    `l_text:Arial_${opts.fontSize}_${opts.fontWeight}:${encodedText}`,
    "co_white",
    `b_rgb:000000${opts.bgOpacity}`,
    `g_${opts.gravity}`,
    `y_${opts.yOffset}`,
  ];
  return parts.join(",");
}

/**
 * Encode de texto pra layer do Cloudinary.
 * Caracteres que precisam escapar: vírgula, barra, dois pontos (separadores do Cloudinary).
 */
function encodeCloudinaryText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\//g, "\\/")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:");
}