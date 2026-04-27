import { useCallback, useEffect, useRef, useState } from 'react';

import { cvApi } from '../services/api';
import { createInitialCVData, normalizeCVData } from './useCV';

const STORAGE_KEY = 'cv-builder-cvs';
const ACTIVE_KEY = 'cv-builder-active-cv';
const MAX_CVS = 10;

export function createNewCV(name) {
  return {
    id: `cv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name || 'My CV',
    data: createInitialCVData(),
  };
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {}
  return null;
}

function writeStorage(cvs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
  } catch {}
}

export function useCVManager(enabled = true) {
  const [cvs, setCvs] = useState(() => {
    const stored = readStorage();
    return stored ?? [createNewCV('My CV')];
  });

  const [activeCvId, setActiveCvIdState] = useState(() => {
    const stored = readStorage() ?? [createNewCV('My CV')];
    const savedId = localStorage.getItem(ACTIVE_KEY);
    return stored.find((c) => c.id === savedId) ? savedId : stored[0].id;
  });

  const [isLoading, setIsLoading] = useState(enabled);
  const [saveStatus, setSaveStatus] = useState('idle');

  const serverSaveTimerRef = useRef(null);
  const resetStatusTimerRef = useRef(null);
  const lastSavedRef = useRef(null);

  // On mount: if no local data, migrate from server
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    if (readStorage()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    cvApi
      .get()
      .then((response) => {
        const normalized = normalizeCVData(response);
        const migrated = createNewCV('My CV');
        migrated.data = normalized;
        const newCvs = [migrated];
        setCvs(newCvs);
        setActiveCvIdState(migrated.id);
        writeStorage(newCvs);
        localStorage.setItem(ACTIVE_KEY, migrated.id);
        lastSavedRef.current = JSON.stringify(normalized);
      })
      .catch((err) => console.error('Failed to load CV', err))
      .finally(() => setIsLoading(false));
  }, [enabled]);

  // Persist CVs list to localStorage
  useEffect(() => {
    writeStorage(cvs);
  }, [cvs]);

  // Persist active CV id
  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeCvId);
  }, [activeCvId]);

  const activeCV = cvs.find((cv) => cv.id === activeCvId) ?? cvs[0];
  const activeDataStr = JSON.stringify(activeCV?.data);

  // Debounced server save for active CV
  useEffect(() => {
    if (!enabled || isLoading || !activeCV) return;
    if (activeDataStr === lastSavedRef.current) return;

    setSaveStatus('saving');
    if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current);

    serverSaveTimerRef.current = setTimeout(async () => {
      try {
        await cvApi.save(activeCV.data);
        lastSavedRef.current = activeDataStr;
        setSaveStatus('saved');
        if (resetStatusTimerRef.current) clearTimeout(resetStatusTimerRef.current);
        resetStatusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 1200);

    return () => {
      if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDataStr, activeCvId, enabled, isLoading]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current);
      if (resetStatusTimerRef.current) clearTimeout(resetStatusTimerRef.current);
    },
    []
  );

  const setActiveCvId = useCallback((id) => setActiveCvIdState(id), []);

  const setActiveData = useCallback(
    (newData) => {
      setCvs((prev) =>
        prev.map((cv) => (cv.id === activeCV?.id ? { ...cv, data: newData } : cv))
      );
    },
    [activeCV?.id]
  );

  const addCV = useCallback(() => {
    setCvs((prev) => {
      if (prev.length >= MAX_CVS) return prev;
      const newCv = createNewCV(`CV ${prev.length + 1}`);
      setActiveCvIdState(newCv.id);
      return [...prev, newCv];
    });
  }, []);

  const deleteCV = useCallback(
    (id) => {
      setCvs((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((cv) => cv.id !== id);
        if (activeCvId === id) setActiveCvIdState(next[0].id);
        return next;
      });
    },
    [activeCvId]
  );

  const renameCV = useCallback((id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCvs((prev) => prev.map((cv) => (cv.id === id ? { ...cv, name: trimmed } : cv)));
  }, []);

  return {
    cvs,
    activeCvId,
    setActiveCvId,
    activeData: activeCV?.data ?? createInitialCVData(),
    setActiveData,
    addCV,
    deleteCV,
    renameCV,
    isLoading,
    saveStatus,
    maxCVs: MAX_CVS,
  };
}
