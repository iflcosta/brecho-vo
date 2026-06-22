/**
 * @spec docs/SPEC-SDD.md#6.3-cloudinary-armazenamento-de-imagens
 * @description Cliente Cloudinary para upload de imagens geradas
 * @author Mavis
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
