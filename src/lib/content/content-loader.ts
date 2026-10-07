import "server-only";
import { connection } from "next/server";
import { contentRepository } from "./content-repository";
import { isEditorEnabled } from "./editor-access";

export async function getPublishedSiteContent() {
  if (isEditorEnabled()) await connection();
  return (await contentRepository.getPublishedContent()).content;
}

export async function getDraftSiteContent() {
  await connection();
  return (await contentRepository.getDraftContent()).content;
}
