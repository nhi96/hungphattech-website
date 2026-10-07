import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content-editor";
import { contentRepository } from "@/lib/content/content-repository";
import { assertEditorReadAccess } from "@/lib/content/editor-access";

export default async function AdminPage() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "127.0.0.1:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  try {
    assertEditorReadAccess(new Request(`${protocol}://${host}/quan-tri`));
  } catch {
    notFound();
  }

  const [draft, published] = await Promise.all([
    contentRepository.getDraftContent(),
    contentRepository.getPublishedContent(),
  ]);

  return (
    <ContentEditor
      initialDraft={draft}
      initialPublishedRevision={published.publishedRevision}
    />
  );
}
