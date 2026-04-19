import { useEffect, useRef, useState } from 'react';

import { cvApi } from '../services/api';

const proficiencyLevels = ['Basic', 'Conversational', 'Fluent', 'Native'];

const baseInitialCVData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  sectionOrder: 'experience',
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asString(value) {
  return typeof value === 'string' ? value : '';
}

function normalizeExperience(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    id: asString(item?.id) || `experience-${index + 1}`,
    jobTitle: asString(item?.jobTitle),
    company: asString(item?.company),
    startDate: asString(item?.startDate),
    endDate: asString(item?.endDate),
    isCurrent: Boolean(item?.isCurrent),
    description: asString(item?.description),
  }));
}

function normalizeEducation(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    id: asString(item?.id) || `education-${index + 1}`,
    degree: asString(item?.degree),
    fieldOfStudy: asString(item?.fieldOfStudy),
    institution: asString(item?.institution),
    startYear: asString(item?.startYear),
    endYear: asString(item?.endYear),
    gpa: asString(item?.gpa),
  }));
}

function normalizeCertifications(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    id: asString(item?.id) || `certification-${index + 1}`,
    name: asString(item?.name),
    issuer: asString(item?.issuer),
    year: asString(item?.year),
  }));
}

function normalizeLanguages(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    id: asString(item?.id) || `language-${index + 1}`,
    language: asString(item?.language),
    proficiency: proficiencyLevels.includes(item?.proficiency)
      ? item.proficiency
      : 'Conversational',
  }));
}

export function createInitialCVData() {
  return clone(baseInitialCVData);
}

export function normalizeCVData(payload) {
  const initial = createInitialCVData();
  const source = payload && typeof payload === 'object' ? payload : {};
  const personal =
    source.personal && typeof source.personal === 'object' ? source.personal : {};

  return {
    personal: {
      ...initial.personal,
      fullName: asString(personal.fullName),
      jobTitle: asString(personal.jobTitle),
      email: asString(personal.email),
      phone: asString(personal.phone),
      location: asString(personal.location),
      linkedin: asString(personal.linkedin),
      github: asString(personal.github),
      website: asString(personal.website),
    },
    summary: asString(source.summary),
    experience: normalizeExperience(source.experience),
    education: normalizeEducation(source.education),
    skills: Array.isArray(source.skills)
      ? source.skills.map(asString).filter(Boolean)
      : [],
    certifications: normalizeCertifications(source.certifications),
    languages: normalizeLanguages(source.languages),
    sectionOrder: source.sectionOrder === 'education' ? 'education' : 'experience',
  };
}

export function useCV(enabled = true) {
  const [data, setData] = useState(createInitialCVData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [saveStatus, setSaveStatus] = useState('idle');
  const lastSavedRef = useRef(JSON.stringify(createInitialCVData()));
  const resetStatusTimerRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;

    setIsLoading(true);
    cvApi
      .get()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const normalized = normalizeCVData(response);
        lastSavedRef.current = JSON.stringify(normalized);
        setData(normalized);
      })
      .catch((error) => {
        console.error('Failed to load CV data', error);
        if (!cancelled) {
          setSaveStatus('error');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || isLoading) {
      return undefined;
    }

    const serialized = JSON.stringify(data);

    if (serialized === lastSavedRef.current) {
      return undefined;
    }

    setSaveStatus('saving');

    const timer = window.setTimeout(async () => {
      try {
        const response = await cvApi.save(data);
        const normalized = normalizeCVData(response.cv || data);

        lastSavedRef.current = JSON.stringify(normalized);
        setSaveStatus('saved');

        if (resetStatusTimerRef.current) {
          window.clearTimeout(resetStatusTimerRef.current);
        }

        resetStatusTimerRef.current = window.setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Failed to save CV data', error);
        setSaveStatus('error');
      }
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [data, enabled, isLoading]);

  useEffect(() => {
    return () => {
      if (resetStatusTimerRef.current) {
        window.clearTimeout(resetStatusTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    setData,
    isLoading,
    saveStatus,
  };
}
