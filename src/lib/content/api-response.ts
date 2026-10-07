import { ZodError } from "zod";
import { InvalidImageError } from "./asset-repository";
import { EditorAccessError } from "./editor-access";
import { RevisionConflictError } from "./content-repository";

export function ok<T>(data: T, status = 200) {
  return Response.json({ ok: true, data }, { status });
}

export function handleAdminError(error: unknown) {
  if (error instanceof EditorAccessError) {
    return Response.json(
      { ok: false, code: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (error instanceof RevisionConflictError) {
    return Response.json(
      { ok: false, code: "REVISION_CONFLICT", message: error.message },
      { status: 409 },
    );
  }
  if (error instanceof ZodError) {
    return Response.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Nội dung chưa hợp lệ.",
        issues: error.issues,
      },
      { status: 422 },
    );
  }
  if (error instanceof InvalidImageError) {
    return Response.json(
      { ok: false, code: "INVALID_IMAGE", message: error.message },
      { status: 422 },
    );
  }

  console.error(error);
  return Response.json(
    {
      ok: false,
      code: "PERSISTENCE_ERROR",
      message: "Không thể lưu dữ liệu trên máy.",
    },
    { status: 500 },
  );
}
