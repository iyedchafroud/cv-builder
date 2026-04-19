const proficiencyLevels = new Set(['Basic', 'Conversational', 'Fluent', 'Native']);

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

function sanitizeExperience(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => ({
      id: asString(item?.id) || `experience-${index + 1}`,
      jobTitle: asString(item?.jobTitle),
      company: asString(item?.company),
      startDate: asString(item?.startDate),
      endDate: asString(item?.endDate),
      isCurrent: Boolean(item?.isCurrent),
      description: asString(item?.description),
    }))
    .filter((item) => item.id);
}

function sanitizeEducation(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => ({
      id: asString(item?.id) || `education-${index + 1}`,
      degree: asString(item?.degree),
      fieldOfStudy: asString(item?.fieldOfStudy),
      institution: asString(item?.institution),
      startYear: asString(item?.startYear),
      endYear: asString(item?.endYear),
      gpa: asString(item?.gpa),
    }))
    .filter((item) => item.id);
}

function sanitizeCertifications(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => ({
      id: asString(item?.id) || `certification-${index + 1}`,
      name: asString(item?.name),
      issuer: asString(item?.issuer),
      year: asString(item?.year),
    }))
    .filter((item) => item.id);
}

function sanitizeLanguages(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => ({
      id: asString(item?.id) || `language-${index + 1}`,
      language: asString(item?.language),
      proficiency: proficiencyLevels.has(item?.proficiency)
        ? item.proficiency
        : 'Conversational',
    }))
    .filter((item) => item.id);
}

function cloneInitialCVData() {
  return clone(baseInitialCVData);
}

function sanitizeCVData(payload) {
  const initial = cloneInitialCVData();
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
    experience: sanitizeExperience(source.experience),
    education: sanitizeEducation(source.education),
    skills: Array.isArray(source.skills)
      ? source.skills.map(asString).filter(Boolean)
      : [],
    certifications: sanitizeCertifications(source.certifications),
    languages: sanitizeLanguages(source.languages),
    sectionOrder: source.sectionOrder === 'education' ? 'education' : 'experience',
  };
}

module.exports = { cloneInitialCVData, sanitizeCVData };
