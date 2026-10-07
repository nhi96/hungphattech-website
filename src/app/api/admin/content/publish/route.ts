import { revalidatePath, revalidateTag } from "next/cache";
import { contentRepository } from "@/lib/content/content-repository";
import { assertEditorWriteAccess } from "@/lib/content/editor-access";
import { handleAdminError, ok } from "@/lib/content/api-response";

export async function POST(request: Request) {
  try {
    assertEditorWriteAccess(request);
    const body = await request.json();
    const result = await contentRepository.publishDraft(
      body.expectedDraftRevision,
      body.expectedPublishedRevision,
    );
    revalidateTag("site-content", { expire: 0 });
    revalidatePath("/", "layout");
    return ok(result);
  } catch (error) {
    return handleAdminError(error);
  }
}
