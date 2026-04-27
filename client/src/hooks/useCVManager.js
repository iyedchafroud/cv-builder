import { useCallback, useEffect, useRef, useState } from 'react';

import { cvsApi } from '../services/api';
import { createInitialCVData } from './useCV';

const ACTIVE_KEY = 'cv-builder-active-cv';
const MAX_CVS = 10;

export function useCVManager(enabled = true) {
  const [cvs, setCvs] = useState([]);
  const [activeCvId, setActiveCvIdState] = useState('');
  const [isLoading, setIsLoading] = useState(enabled);
  const [saveStatus, setSaveStatus] = useState('idle');

  const saveTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const lastSavedRef = useRef('');

  // Load all CVs from server on mount
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    cvsApi
      .list()
      .then((serverCvs) => {
        setCvs(serverCvs);

        // Restore last-used CV or fall back to the first one
        const storedId = localStorage.getItem(ACTIVE_KEY);
        const validId = serverCvs.find((c) => c.id === storedId)
          ? storedId
          : serverCvs[0]?.id ?? '';

        setActiveCvIdState(validId);
        if (validId) localStorage.setItem(ACTIVE_KEY, validId);

        // Seed the "last saved" ref so we don't immediately re-save on mount
        const active = serverCvs.find((c) => c.id === validId);
        if (active) lastSavedRef.current = JSON.stringify(active.data);
      })
      .catch((err) => {
        console.error('Failed to load CVs', err);
        setSaveStatus('error');
      })
      .finally(() => setIsLoading(false));
  }, [enabled]);

  // Persist the active CV selection to localStorage
  useEffect(() => {
    if (activeCvId) localStorage.setItem(ACTIVE_KEY, activeCvId);
  }, [activeCvId]);

  const activeCV = cvs.find((cv) => cv.id === activeCvId) ?? cvs[0] ?? null;
  const activeData = activeCV?.data ?? createInitialCVData();
  const activeDataStr = JSON.stringify(activeData);

  // Debounced server save whenever the active CV's data changes
  useEffect(() => {
    if (!enabled || isLoading || !activeCV) return;
    if (activeDataStr === lastSavedRef.current) return;

    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await cvsApi.save(activeCV.id, activeCV.data);
        lastSavedRef.current = activeDataStr;
        setSaveStatus('saved');
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Failed to save CV', err);
        setSaveStatus('error');
      }
    }, 1200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDataStr, activeCvId, enabled, isLoading]);

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    []
  );

  // Switch the active CV (update lastSavedRef so we don't re-save the newly selected CV)
  const setActiveCvId = useCallback(
    (id) => {
      setActiveCvIdState(id);
      const cv = cvs.find((c) => c.id === id);
      if (cv) lastSavedRef.current = JSON.stringify(cv.data);
    },
    [cvs]
  );

  // Update the active CV's data locally (triggers the debounced save above)
  const setActiveData = useCallback(
    (newData) => {
      setCvs((prev) =>
        prev.map((cv) => (cv.id === activeCV?.id ? { ...cv, data: newData } : cv))
      );
    },
    [activeCV?.id]
  );

  // Create a new CV on the server
  const addCV = useCallback(async () => {
    if (cvs.length >= MAX_CVS) return;
    try {
      const newCv = await cvsApi.create(`CV ${cvs.length + 1}`);
      setCvs((prev) => [...prev, newCv]);
      setActiveCvIdState(newCv.id);
      localStorage.setItem(ACTIVE_KEY, newCv.id);
      lastSavedRef.current = JSON.stringify(newCv.data);
    } catch (err) {
      console.error('Failed to create CV', err);
      alert('Failed to create CV. Please try again.');
    }
  }, [cvs.length]);

  // Delete a CV from the server (not allowed if only 1 remains)
  const deleteCV = useCallback(
    async (id) => {
      if (cvs.length <= 1) return;
      try {
        await cvsApi.remove(id);
        setCvs((prev) => {
          const next = prev.filter((cv) => cv.id !== id);
          if (activeCvId === id) {
            const newActiveId = next[0]?.id ?? '';
            setActiveCvIdState(newActiveId);
            if (newActiveId) localStorage.setItem(ACTIVE_KEY, newActiveId);
            const newActive = next.find((c) => c.id === newActiveId);
            lastSavedRef.current = newActive ? JSON.stringify(newActive.data) : '';
          }
          return next;
        });
      } catch (err) {
        console.error('Failed to delete CV', err);
        alert('Failed to delete CV. Please try again.');
      }
    },
    [cvs.length, activeCvId]
  );

  // Rename a CV (optimistic update, reverts on error)
  const renameCV = useCallback(async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Optimistic
    setCvs((prev) => prev.map((cv) => (cv.id === id ? { ...cv, name: trimmed } : cv)));

    try {
      await cvsApi.rename(id, trimmed);
    } catch (err) {
      console.error('Failed to rename CV', err);
      // Revert: reload from server
      cvsApi.list().then(setCvs).catch(() => {});
    }
  }, []);

  return {
    cvs,
    activeCvId: activeCV?.id ?? '',
    setActiveCvId,
    activeData,
    setActiveData,
    addCV,
    deleteCV,
    renameCV,
    isLoading,
    saveStatus,
    maxCVs: MAX_CVS,
  };
}
