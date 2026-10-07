import { contentRepository } from "@/lib/content/content-repository";
import { assertEditorWriteAccess } from "@/lib/content/editor-access";
import { handleAdminError, ok } from "@/lib/content/api-response";

export async function POST(request: Request) {
  try {
    assertEditorWriteAccess(request);
    const body = await request.json();
    const draft = await contentRepository.resetDraftFromPublished(
      body.expectedDraftRevision,
      body.expectedPublishedRevision,
    );
    return ok({ draft });
  } catch (error) {
    return handleAdminError(error);
  }
}
