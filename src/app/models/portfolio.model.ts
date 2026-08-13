export interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  about: string;
  manifesto: string;
  availability: string;
  responsePromise: string;
  photo: string; // hero photo path
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface Experience {
  period: string;
  location: string;
  company: string;
  role: string;
  description: string;
}

export interface Education {
  period: string;
  title: string;
  school: string;
  details: string[];
}

export interface Project {
  period: string;
  title: string;
  role: string;
  stack?: string;
  image: string;
  bullets: string[];
  demoUrl?: string;
  sourceUrl?: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface NavLink {
  id: string;
  label: string;
}