function cleanLinkLabel(value) {
  return String(value || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function toBulletLines(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim().replace(/^[*-]\s*/, ''))
    .filter(Boolean);
}

function ExperienceSection({ experience }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">
        Professional Experience
      </h3>
      <div className="space-y-4">
        {experience.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-baseline mb-1 gap-4">
              <h4 className="font-bold text-base">{item.jobTitle}</h4>
              <span className="text-sm whitespace-nowrap">
                {item.startDate} - {item.isCurrent ? 'Present' : item.endDate}
              </span>
            </div>
            <div className="text-sm font-semibold italic mb-2">{item.company}</div>
            <ul className="list-disc list-outside ml-4 text-sm space-y-1">
              {toBulletLines(item.description).map((line, index) => (
                <li key={`${item.id}-${index}`}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationSection({ education }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">
        Education
      </h3>
      <div className="space-y-3">
        {education.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-baseline mb-1 gap-4">
              <h4 className="font-bold text-base">{item.institution}</h4>
              <span className="text-sm whitespace-nowrap">
                {item.startYear} - {item.endYear}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-semibold italic">{item.degree}</span> in {item.fieldOfStudy}
              {item.gpa && <span> | GPA: {item.gpa}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CVPreview({ data }) {
  const contactItems = [
    data.personal.location,
    data.personal.email,
    data.personal.phone,
    data.personal.linkedin && cleanLinkLabel(data.personal.linkedin),
    data.personal.github && cleanLinkLabel(data.personal.github),
    data.personal.website && cleanLinkLabel(data.personal.website),
  ].filter(Boolean);

  return (
    <div className="w-full bg-white shadow-2xl min-h-[297mm] p-[20mm] text-black text-[10pt] leading-relaxed">
      <div className="mb-6 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">
          {data.personal.fullName}
        </h1>
        <div className="text-sm flex flex-wrap gap-x-3 gap-y-1 text-gray-700">
          {contactItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {data.summary && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">
            Professional Summary
          </h3>
          <p className="text-sm text-justify">{data.summary}</p>
        </div>
      )}

      {data.sectionOrder === 'experience' ? (
        <>
          {data.experience.length > 0 && <ExperienceSection experience={data.experience} />}
          {data.education.length > 0 && <EducationSection education={data.education} />}
        </>
      ) : (
        <>
          {data.education.length > 0 && <EducationSection education={data.education} />}
          {data.experience.length > 0 && <ExperienceSection experience={data.experience} />}
        </>
      )}

      {data.skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">
            Skills
          </h3>
          <p className="text-sm">{data.skills.join(', ')}</p>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">
            Certifications
          </h3>
          <ul className="list-disc list-outside ml-4 text-sm space-y-1">
            {data.certifications.map((item) => (
              <li key={item.id}>
                <span className="font-bold">{item.name}</span> - {item.issuer} ({item.year})
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.languages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-wider">
            Languages
          </h3>
          <p className="text-sm">
            {data.languages.map((item) => `${item.language} (${item.proficiency})`).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
