export class EditorAccessError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 403) {
    super(message);
    this.name = "EditorAccessError";
    this.code = code;
    this.status = status;
  }
}

type AccessOptions = {
  nodeEnv?: string;
  enabled?: boolean;
};

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

function resolveOptions(options?: AccessOptions) {
  return {
    nodeEnv: options?.nodeEnv ?? process.env.NODE_ENV,
    enabled: options?.enabled ?? process.env.CONTENT_EDITOR_ENABLED === "true",
  };
}

export function assertEditorReadAccess(request: Request, options?: AccessOptions) {
  const config = resolveOptions(options);
  const url = new URL(request.url);

  if (config.nodeEnv !== "development" && !config.enabled) {
    throw new EditorAccessError("EDITOR_DISABLED", "Trình quản trị đang bị tắt.", 404);
  }
  if (!loopbackHosts.has(url.hostname)) {
    throw new EditorAccessError(
      "LOOPBACK_REQUIRED",
      "Trình quản trị chỉ cho phép truy cập từ máy local.",
    );
  }
}

export function assertEditorWriteAccess(request: Request, options?: AccessOptions) {
  assertEditorReadAccess(request, options);
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("host") ?? url.host;
  const expectedOrigin = `${url.protocol}//${requestHost}`;
  const contentType = request.headers.get("content-type") ?? "";

  let originUrl: URL | null = null;
  try {
    originUrl = origin ? new URL(origin) : null;
  } catch {
    originUrl = null;
  }

  if (
    !originUrl ||
    originUrl.origin !== expectedOrigin ||
    !loopbackHosts.has(originUrl.hostname)
  ) {
    throw new EditorAccessError(
      "INVALID_ORIGIN",
      "Nguồn gửi yêu cầu không hợp lệ.",
    );
  }
  if (
    !contentType.startsWith("application/json") &&
    !contentType.startsWith("multipart/form-data")
  ) {
    throw new EditorAccessError(
      "INVALID_CONTENT_TYPE",
      "Định dạng yêu cầu không được hỗ trợ.",
      415,
    );
  }
}

export function isEditorEnabled() {
  return process.env.NODE_ENV === "development" || process.env.CONTENT_EDITOR_ENABLED === "true";
}
