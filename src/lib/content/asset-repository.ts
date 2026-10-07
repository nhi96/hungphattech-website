import { randomUUID } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export class InvalidImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidImageError";
  }
}

export type AssetRecord = {
  id: string;
  path: string;
  alt: string;
  mime: "image/webp";
  width: number;
  height: number;
  originalName: string;
};

const maxBytes = 8 * 1024 * 1024;
const maxDimension = 10_000;
const maxPixels = 40_000_000;

export class FileAssetRepository {
  readonly uploadRoot: string;

  constructor(uploadRoot = path.join(process.cwd(), "public", "uploads")) {
    this.uploadRoot = path.resolve(uploadRoot);
  }

  async saveImage(input: Buffer, originalName: string): Promise<AssetRecord> {
    if (input.length === 0 || input.length > maxBytes) {
      throw new InvalidImageError("Ảnh phải có dung lượng không quá 8 MB.");
    }
    if (/\.svg$/i.test(originalName)) {
      throw new InvalidImageError("Không hỗ trợ ảnh SVG.");
    }

    try {
      const decoder = sharp(input, {
        animated: false,
        failOn: "warning",
        limitInputPixels: maxPixels,
      });
      const metadata = await decoder.metadata();
      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;
      const pages = metadata.pages ?? 1;

      if (
        !width ||
        !height ||
        width > maxDimension ||
        height > maxDimension ||
        width * height > maxPixels ||
        pages > 1
      ) {
        throw new InvalidImageError("Kích thước hoặc định dạng ảnh không được hỗ trợ.");
      }

      const id = `asset-${randomUUID()}`;
      const filename = `${id}.webp`;
      const destination = path.resolve(this.uploadRoot, filename);
      const relative = path.relative(this.uploadRoot, destination);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new InvalidImageError("Đường dẫn ảnh không hợp lệ.");
      }

      await mkdir(this.uploadRoot, { recursive: true });
      const output = await decoder.rotate().webp({ quality: 84 }).toBuffer();
      const temporary = `${destination}.${randomUUID()}.tmp`;
      await writeFile(temporary, output);
      await rename(temporary, destination);

      return {
        id,
        path: `/uploads/${filename}`,
        alt: "",
        mime: "image/webp",
        width,
        height,
        originalName: path.basename(originalName).slice(0, 255),
      };
    } catch (error) {
      if (error instanceof InvalidImageError) throw error;
      throw new InvalidImageError("Tệp tải lên không phải ảnh hợp lệ.");
    }
  }
}

export const assetRepository = new FileAssetRepository();
