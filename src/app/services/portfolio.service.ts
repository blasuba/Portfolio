import { Injectable } from '@angular/core';
import {
  Profile, SkillGroup, Experience, Education, Project, Stat, ProcessStep,
} from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly profile: Profile = {
    name: 'Esubalew Gashaw Admass',
    title: 'Software Developer',
    location: 'Addis Ababa, Ethiopia',
    email: 'esubalew.gashiaw@gmail.com',
    phone: '+251-965496587',
    linkedin: 'linkedin.com/in/esubalew-gashaw',
    about:
      'Results-driven Software Developer with hands-on experience building responsive web and cross-platform mobile applications. Proficient in React, Angular, and Flutter, with strong backend integration skills using Java Spring Boot.',
    manifesto:
      "I don't just write code — I build things people trust with their money, their data, and their time. That's why I care as much about a clean API contract as I do about a pixel-perfect button.",
    availability: 'Available for freelance & full-time work',
    responsePromise: 'I typically reply within 24 hours',
    photo: '/assets/images/esuba 1.jpg',
  };

  private readonly companies: string[] = ['Bunna Bank', 'Blata Technology Group', 'Yegna Microfinance S.C'];

  private readonly stats: Stat[] = [
    { value: 3, suffix: '+', label: 'Companies Worked With' },
    { value: 4, suffix: '+', label: 'Projects Delivered' },
    { value: 2, suffix: '+', label: 'Years of Experience' },
    { value: 3, suffix: '', label: 'Tech Stacks Mastered' },
  ];

  private readonly processSteps: ProcessStep[] = [
    { step: '01', title: 'Understand', description: 'I start by listening — what problem are we actually solving, and for whom.' },
    { step: '02', title: 'Design', description: 'I map the data flow and UI before writing a line of code, so nothing gets rebuilt twice.' },
    { step: '03', title: 'Build', description: 'Clean, modular code — frontend and backend integrated early, tested as I go.' },
    { step: '04', title: 'Deliver', description: 'Deployed, documented, and handed over with room to grow — not a dead end.' },
  ];

  private readonly skillGroups: SkillGroup[] = [
    { title: 'Frontend Development', skills: ['JavaScript', 'TypeScript', 'Dart', 'React', 'Angular', 'Flutter'] },
    { title: 'Backend Development', skills: ['Java', 'Node.js', 'Spring Boot', 'MySQL', 'PostgreSQL'] },
    { title: 'Other', skills: ['REST API Design', 'Microservices', 'System Integration', 'Git'] },
  ];

  private readonly experiences: Experience[] = [
    {
      period: '07/2026 – Present',
      location: 'Addis Ababa, Ethiopia',
      company: 'Bunna Bank',
      role: 'Frontend Developer',
      description:
        'Building highly responsive web and cross-platform mobile applications using React, Angular, and Flutter. Integrating with Java Spring Boot backends for secure, scalable digital banking solutions.',
    },
    {
      period: '05/2025 – 07/2026',
      location: 'Addis Ababa',
      company: 'Blata Technology Group',
      role: 'Software Developer',
      description:
        'Led development on the Blata Technology website (React, Node.js, PostgreSQL) and worked as a Full-Stack Developer on the Atuye Market LLC project (Angular, Spring Boot, MySQL).',
    },
    {
      period: '06/2024 – 06/2025',
      location: 'Addis Ababa',
      company: 'Yegna Microfinance S.C',
      role: 'Junior Web Developer',
      description:
        'Handled customer inquiries and service operations while administering web platforms and resolving technical issues.',
    },
  ];

  private readonly education: Education[] = [
    {
      period: '2020 – 2023',
      title: 'B.Sc. in Information Technology',
      school: 'Hawassa University',
      details: [
        'Graduated with a CGPA of 3.66 and passed the national exit examination.',
        'Strong foundation in software development, databases, networking, and information systems.',
      ],
    },
  ];

  private readonly projects: Project[] = [
    {
      period: '07/2026 – Present',
      title: 'Bunna Bank – Transaction Settlement & Integration Management Platform',
      role: 'Full-Stack Developer',
      stack: 'Angular 17+, TypeScript, RxJS, SCSS, Spring Boot, REST APIs',
      image: '/assets/images/proj1.png',
      demoUrl: 'https://www.bunnabank.com',
      bullets: [
        'Architected modular, domain-driven Angular standalone component structures for real-time transaction batching and automated reconciliation.',
        'Engineered dynamic dashboard interfaces featuring real-time settlement monitoring, interactive transaction filters, and audit trail logs.',
        'Integrated core frontend application modules with secure, enterprise-grade REST APIs built on Java Spring Boot.',
        'Implemented robust reactive form validation and guard strategies to safeguard batch execution and prevent corrupt data submissions.',
        'Optimized state management and rendering performance for high-volume financial data tables and third-party integration workspaces.',
      ],
    },
    {
      period: '10/2025 – Present',
      title: 'Atuye Market LLC – Website & Application',
      role: 'Full-Stack Developer',
      stack: 'Angular, Spring Boot, MySQL',
      image: '/assets/images/atuye.png',
      bullets: [
        'Designed the database schema and built RESTful APIs connecting front-end and back-end systems.',
        'Developed a scalable, responsive Angular front end end-to-end.',
        'Optimized queries and data structures for efficient, reliable data management.',
        'Maintained and deployed the platform for smooth, ongoing operation.',
      ],
    },
    {
      period: '05/2025 – 10/2025',
      title: 'Blata Technology Group Website',
      role: 'Full-Stack Developer',
      stack: 'React, Node.js, PostgreSQL',
      image: '/assets/images/blata.png',
      demoUrl: 'https://blatatechnology.net',
      bullets: [
        'Developed and deployed a responsive company website from scratch.',
        'Built and integrated RESTful APIs for seamless front-end/back-end communication.',
        'Designed and optimized the PostgreSQL schema for reliability.',
        'Supported ongoing deployment, maintenance, and updates.',
      ],
    },
  ];

  private readonly certificates: string[] = [
    'Artificial Intelligence — Udacity.com',
    'Android Developer Fundamentals — Udacity.com',
    'Job Employability Skills — Dereja.com',
  ];

  getProfile(): Profile { return this.profile; }
  getCompanies(): string[] { return this.companies; }
  getStats(): Stat[] { return this.stats; }
  getProcessSteps(): ProcessStep[] { return this.processSteps; }
  getSkillGroups(): SkillGroup[] { return this.skillGroups; }
  getExperiences(): Experience[] { return this.experiences; }
  getEducation(): Education[] { return this.education; }
  getProjects(): Project[] { return this.projects; }
  getCertificates(): string[] { return this.certificates; }
}