import { IconName } from '../icons';

export interface Profile {
  name: string;
  firstName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github?: string;
  telegram?: string;
  about: string;
  manifesto: string;
  availability: string;
  responsePromise: string;
  /** Background-removed head-and-shoulders portrait (hero) — the site's only photo. */
  cutout: string;
  resumeUrl: string;
}

export type SkillCategory = 'Frontend' | 'Backend' | 'Data' | 'Mobile & Tools';

export interface Skill {
  name: string;
  icon: string;
  category: SkillCategory;
}

export interface Service {
  icon: IconName;
  name: string;
  description: string;
}

/** Short numbered point (highlights strip, "why work with me"). */
export interface Feature {
  number: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface Stat {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
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

export interface Certificate {
  name: string;
  issuer: string;
}

export type ProjectCategory = 'Fintech & Banking' | 'Healthcare & Enterprise' | 'Full-Stack Web';

export type ProjectFilter = 'All' | ProjectCategory;

export interface Project {
  id: string;
  period: string;
  title: string;
  role: string;
  /** Organisation the project was built for, shown on the card and in the case study. */
  client?: string;
  category: ProjectCategory;
  /** One-line summary shown on the card. */
  summary: string;
  /** Full overview shown in the details modal. */
  description: string;
  /** Headline result shown as a chip on the card. */
  impact: string;
  tags: string[];
  image: string;
  bullets: string[];
  demoUrl?: string;
  sourceUrl?: string;
  featured?: boolean;
}

export interface NavLink {
  id: string;
  label: string;
}

export interface ContactLink {
  icon: IconName;
  label: string;
  value: string;
  url: string;
  external: boolean;
}
