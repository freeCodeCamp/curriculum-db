'use client';

import { useState, useEffect, useCallback } from 'react';
import { compare, applyPatch, type Operation } from 'fast-json-patch';
import {
  type DraftType,
  loadDraftRecord,
  getDraftKey,
  discardDraftRecord,
  applyDraftPatch,
  isDraftOutdated as checkOutdated,
} from './drafts';
import { hashObject } from './utils';

export interface UseDraftReturn<T> {
  edited: T | undefined;
  updateEdited: (updater: (prev: T) => T) => void;
  hasSavedDraft: boolean;
  hasUnsavedChanges: boolean;
  isDraftOutdated: boolean;
  currentPatch: Operation[];
  save: () => void;
  discard: () => void;
  getExportData: () => string | null;
  importPatchData: (json: string) => void;
}

export function useDraft<T>(
  type: DraftType,
  id: string,
  original: T | undefined
): UseDraftReturn<T> {
  const [edited, setEdited] = useState<T | undefined>(undefined);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [outdated, setOutdated] = useState(false);

  useEffect(() => {
    if (!original) return;
    const record = loadDraftRecord(type, id);
    if (record) {
      setHasSavedDraft(true);
      setOutdated(checkOutdated(record, original));
      try {
        setEdited(applyDraftPatch(original, record.patch));
      } catch {
        setEdited(structuredClone(original));
      }
    } else {
      setEdited(structuredClone(original));
    }
    setHasUnsavedChanges(false);
  }, [original, type, id]);

  const updateEdited = useCallback((updater: (prev: T) => T) => {
    setEdited((prev) => (prev ? updater(prev) : prev));
    setHasUnsavedChanges(true);
  }, []);

  const save = useCallback(() => {
    if (!original || !edited) return;
    const patch = compare(
      original as Record<string, unknown>,
      edited as Record<string, unknown>
    );
    if (patch.length === 0) return;
    const record = {
      updatedAt: new Date().toISOString(),
      originalHash: hashObject(original),
      patch,
    };
    localStorage.setItem(getDraftKey(type, id), JSON.stringify(record));
    setHasSavedDraft(true);
    setHasUnsavedChanges(false);
  }, [original, edited, type, id]);

  const discard = useCallback(() => {
    if (!original) return;
    discardDraftRecord(type, id);
    setEdited(structuredClone(original));
    setHasSavedDraft(false);
    setHasUnsavedChanges(false);
    setOutdated(false);
  }, [original, type, id]);

  const currentPatch: Operation[] =
    original && edited
      ? compare(
          original as Record<string, unknown>,
          edited as Record<string, unknown>
        )
      : [];

  const getExportData = useCallback((): string | null => {
    if (!original || !edited) return null;
    const patch = compare(
      original as Record<string, unknown>,
      edited as Record<string, unknown>
    );
    if (patch.length === 0) return null;
    return JSON.stringify(
      {
        type,
        id,
        patch,
        updatedAt: new Date().toISOString(),
        originalHash: hashObject(original),
      },
      null,
      2
    );
  }, [original, edited, type, id]);

  const importPatchData = useCallback(
    (json: string) => {
      if (!original) return;
      try {
        const data = JSON.parse(json) as { patch: Operation[] };
        const clone = structuredClone(original);
        applyPatch(clone as Record<string, unknown>, data.patch);
        setEdited(clone);
        setHasUnsavedChanges(true);
      } catch (e) {
        console.error('Failed to import patch:', e);
      }
    },
    [original]
  );

  return {
    edited,
    updateEdited,
    hasSavedDraft,
    hasUnsavedChanges,
    isDraftOutdated: outdated,
    currentPatch,
    save,
    discard,
    getExportData,
    importPatchData,
  };
}
