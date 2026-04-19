const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    jobTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    degree: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    institution: { type: String, default: '' },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    gpa: { type: String, default: '' },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    year: { type: String, default: '' },
  },
  { _id: false }
);

const languageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    language: { type: String, default: '' },
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
      default: 'Conversational',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personal: { type: personalSchema, default: () => ({}) },
    summary: { type: String, default: '' },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    skills: { type: [String], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    languages: { type: [languageSchema], default: [] },
    sectionOrder: {
      type: String,
      enum: ['experience', 'education'],
      default: 'experience',
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const CV = mongoose.models.CV || mongoose.model('CV', cvSchema);

module.exports = { User, CV };
