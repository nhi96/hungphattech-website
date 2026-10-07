import { contentRepository } from "@/lib/content/content-repository";
import { assertEditorReadAccess } from "@/lib/content/editor-access";
import { handleAdminError, ok } from "@/lib/content/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    assertEditorReadAccess(request);
    const [draft, published] = await Promise.all([
      contentRepository.getDraftContent(),
      contentRepository.getPublishedContent(),
    ]);
    return ok({
      draft,
      publishedRevision: published.publishedRevision,
      pages: [
        { id: "home", label: "Trang chủ" },
        { id: "solar", label: "Điện mặt trời" },
        { id: "camera", label: "Camera giám sát" },
      ],
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
