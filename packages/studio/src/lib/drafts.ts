import { compare, applyPatch, type Operation } from 'fast-json-patch';
import { hashObject } from './utils';

export type DraftType = 'block' | 'challenge';

export interface DraftRecord {
  updatedAt: string;
  originalHash: string;
  patch: Operation[];
}

export interface DraftEntry {
  type: DraftType;
  id: string;
  record: DraftRecord;
}

export function getDraftKey(type: DraftType, id: string): string {
  return `draft:${type}:${id}`;
}

export function parseDraftKey(
  key: string
): { type: DraftType; id: string } | null {
  const match = key.match(/^draft:(block|challenge):(.+)$/);
  if (!match || !match[1] || !match[2]) return null;
  return { type: match[1] as DraftType, id: match[2] };
}

export function loadDraftRecord(
  type: DraftType,
  id: string
): DraftRecord | null {
  const raw = localStorage.getItem(getDraftKey(type, id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftRecord;
  } catch {
    return null;
  }
}

export function saveDraftRecord(
  type: DraftType,
  id: string,
  original: unknown,
  modified: unknown
): Operation[] {
  const patch = compare(
    original as Record<string, unknown>,
    modified as Record<string, unknown>
  );
  if (patch.length === 0) return [];
  const record: DraftRecord = {
    updatedAt: new Date().toISOString(),
    originalHash: hashObject(original),
    patch,
  };
  localStorage.setItem(getDraftKey(type, id), JSON.stringify(record));
  return patch;
}

export function discardDraftRecord(type: DraftType, id: string): void {
  localStorage.removeItem(getDraftKey(type, id));
}

export function applyDraftPatch<T>(original: T, patch: Operation[]): T {
  const clone = structuredClone(original);
  applyPatch(clone as Record<string, unknown>, patch);
  return clone;
}

export function isDraftOutdated(
  record: DraftRecord,
  original: unknown
): boolean {
  return record.originalHash !== hashObject(original);
}

export function listAllDrafts(): DraftEntry[] {
  const entries: DraftEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const parsed = parseDraftKey(key);
    if (!parsed) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const record = JSON.parse(raw) as DraftRecord;
      entries.push({ ...parsed, record });
    } catch {
      // Skip invalid entries
    }
  }
  return entries;
}

export function exportDraftPatch(type: DraftType, id: string): string | null {
  const record = loadDraftRecord(type, id);
  if (!record) return null;
  return JSON.stringify({ type, id, ...record }, null, 2);
}

export function importDraftPatch(
  json: string,
  original: unknown
): { type: DraftType; id: string; patch: Operation[] } {
  const data = JSON.parse(json) as {
    type: DraftType;
    id: string;
    patch: Operation[];
  };
  const record: DraftRecord = {
    updatedAt: new Date().toISOString(),
    originalHash: hashObject(original),
    patch: data.patch,
  };
  localStorage.setItem(getDraftKey(data.type, data.id), JSON.stringify(record));
  return data;
}
