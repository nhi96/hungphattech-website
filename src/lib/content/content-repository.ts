import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createDraftFromPublished,
  parseDraftEnvelope,
  parsePublishedEnvelope,
  type DraftEnvelope,
  type PublishedEnvelope,
  type SiteContent,
} from "./content-schema.ts";

export class RevisionConflictError extends Error {
  constructor() {
    super("Nội dung đã được thay đổi ở một phiên khác.");
    this.name = "RevisionConflictError";
  }
}

type RepositoryOptions = {
  root?: string;
  seedPath?: string;
};

type PublishResult = {
  published: PublishedEnvelope;
  draft: DraftEnvelope;
};

type TransactionJournal = {
  published: PublishedEnvelope;
  draft: DraftEnvelope;
};

export class FileContentRepository {
  private readonly root: string;
  private readonly seedPath: string;
  private readonly publishedPath: string;
  private readonly draftPath: string;
  private readonly historyPath: string;
  private readonly journalPath: string;
  private initialization: Promise<void> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(options: RepositoryOptions = {}) {
    this.root = options.root ?? path.join(process.cwd(), ".content");
    this.seedPath =
      options.seedPath ?? path.join(process.cwd(), ".content", "default-content.json");
    this.publishedPath = path.join(this.root, "published.json");
    this.draftPath = path.join(this.root, "draft.json");
    this.historyPath = path.join(this.root, "history");
    this.journalPath = path.join(this.root, "transaction.json");
  }

  async getPublishedContent(): Promise<PublishedEnvelope> {
    await this.ensureInitialized();
    return this.readPublished();
  }

  async getDraftContent(): Promise<DraftEnvelope> {
    await this.ensureInitialized();
    return this.readDraft();
  }

  async saveDraft(content: SiteContent, expectedDraftRevision: number): Promise<DraftEnvelope> {
    return this.withWriteLock(async () => {
      await this.ensureInitialized();
      const current = await this.readDraft();
      if (current.draftRevision !== expectedDraftRevision) {
        throw new RevisionConflictError();
      }
      const next = parseDraftEnvelope({
        ...current,
        draftRevision: current.draftRevision + 1,
        content,
      });
      await this.atomicWrite(this.draftPath, next);
      return next;
    });
  }

  async resetDraftFromPublished(
    expectedDraftRevision: number,
    expectedPublishedRevision: number,
  ): Promise<DraftEnvelope> {
    return this.withWriteLock(async () => {
      await this.ensureInitialized();
      const [published, draft] = await Promise.all([this.readPublished(), this.readDraft()]);
      this.assertRevisions(
        draft,
        published,
        expectedDraftRevision,
        expectedPublishedRevision,
      );
      const next = parseDraftEnvelope({
        schemaVersion: 1,
        draftRevision: draft.draftRevision + 1,
        basePublishedRevision: published.publishedRevision,
        content: structuredClone(published.content),
      });
      await this.atomicWrite(this.draftPath, next);
      return next;
    });
  }

  async publishDraft(
    expectedDraftRevision: number,
    expectedPublishedRevision: number,
  ): Promise<PublishResult> {
    return this.withWriteLock(async () => {
      await this.ensureInitialized();
      const [published, draft] = await Promise.all([this.readPublished(), this.readDraft()]);
      this.assertRevisions(
        draft,
        published,
        expectedDraftRevision,
        expectedPublishedRevision,
      );

      const nextPublished = parsePublishedEnvelope({
        schemaVersion: 1,
        publishedRevision: published.publishedRevision + 1,
        content: structuredClone(draft.content),
      });
      const nextDraft = parseDraftEnvelope({
        schemaVersion: 1,
        draftRevision: draft.draftRevision + 1,
        basePublishedRevision: nextPublished.publishedRevision,
        content: structuredClone(nextPublished.content),
      });

      await this.writeHistory(published);
      await this.atomicWrite(this.journalPath, {
        published: nextPublished,
        draft: nextDraft,
      } satisfies TransactionJournal);
      await this.atomicWrite(this.publishedPath, nextPublished);
      await this.atomicWrite(this.draftPath, nextDraft);
      await rm(this.journalPath, { force: true });
      await this.pruneHistory();

      return { published: nextPublished, draft: nextDraft };
    });
  }

  async listHistory(): Promise<string[]> {
    await this.ensureInitialized();
    const files = await readdir(this.historyPath);
    return files
      .filter((file) => file.endsWith(".json"))
      .sort()
      .reverse()
      .map((file) => path.join(this.historyPath, file));
  }

  private async ensureInitialized() {
    this.initialization ??= this.initialize();
    await this.initialization;
  }

  private async initialize() {
    await mkdir(this.root, { recursive: true });
    await mkdir(this.historyPath, { recursive: true });
    await this.recoverTransaction();

    try {
      await readFile(this.publishedPath, "utf8");
    } catch {
      const seed = parsePublishedEnvelope(
        JSON.parse(await readFile(this.seedPath, "utf8")),
      );
      await this.atomicWrite(this.publishedPath, seed);
    }

    try {
      await readFile(this.draftPath, "utf8");
    } catch {
      const published = await this.readPublished();
      await this.atomicWrite(this.draftPath, createDraftFromPublished(published));
    }
  }

  private async recoverTransaction() {
    let journal: TransactionJournal;
    try {
      journal = JSON.parse(await readFile(this.journalPath, "utf8"));
    } catch {
      return;
    }

    const published = parsePublishedEnvelope(journal.published);
    const draft = parseDraftEnvelope(journal.draft);
    await this.atomicWrite(this.publishedPath, published);
    await this.atomicWrite(this.draftPath, draft);
    await rm(this.journalPath, { force: true });
  }

  private async readPublished() {
    return parsePublishedEnvelope(JSON.parse(await readFile(this.publishedPath, "utf8")));
  }

  private async readDraft() {
    return parseDraftEnvelope(JSON.parse(await readFile(this.draftPath, "utf8")));
  }

  private assertRevisions(
    draft: DraftEnvelope,
    published: PublishedEnvelope,
    expectedDraftRevision: number,
    expectedPublishedRevision: number,
  ) {
    if (
      draft.draftRevision !== expectedDraftRevision ||
      published.publishedRevision !== expectedPublishedRevision
    ) {
      throw new RevisionConflictError();
    }
  }

  private async atomicWrite(target: string, value: unknown) {
    const temporary = `${target}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(temporary, target);
  }

  private async writeHistory(published: PublishedEnvelope) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const target = path.join(
      this.historyPath,
      `${stamp}-r${published.publishedRevision}.json`,
    );
    await this.atomicWrite(target, published);
  }

  private async pruneHistory() {
    const history = await this.listHistory();
    await Promise.all(history.slice(20).map((file) => rm(file, { force: true })));
  }

  private async withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.writeQueue;
    let release!: () => void;
    this.writeQueue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}

export const contentRepository = new FileContentRepository();
