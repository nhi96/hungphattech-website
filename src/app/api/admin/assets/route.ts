import { assetRepository } from "@/lib/content/asset-repository";
import { assertEditorWriteAccess } from "@/lib/content/editor-access";
import { handleAdminError, ok } from "@/lib/content/api-response";

export async function POST(request: Request) {
  try {
    assertEditorWriteAccess(request);
    const formData = await request.formData();
    const value = formData.get("file");
    if (!(value instanceof File)) {
      return Response.json(
        { ok: false, code: "FILE_REQUIRED", message: "Vui lòng chọn ảnh." },
        { status: 422 },
      );
    }
    const asset = await assetRepository.saveImage(
      Buffer.from(await value.arrayBuffer()),
      value.name,
    );
    return ok({ asset }, 201);
  } catch (error) {
    return handleAdminError(error);
  }
}
