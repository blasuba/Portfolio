export interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  about: string;
  imageUrl?: string;
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
  points: string[];
}