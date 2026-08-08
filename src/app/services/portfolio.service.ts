import { Injectable } from '@angular/core';
import {
  Profile,
  SkillGroup,
  Experience,
  Education,
  Project,
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
      'Results-driven Software Developer with hands-on experience building responsive web and cross-platform mobile applications. Proficient in React, Angular, and Flutter, with strong backend integration skills using Java Spring Boot. Passionate about building secure, scalable, user-centric digital solutions.',
  };

  private readonly skillGroups: SkillGroup[] = [
    {
      title: 'Frontend Development',
      skills: ['JavaScript', 'TypeScript', 'Dart', 'React', 'Angular', 'Flutter'],
    },
    {
      title: 'Backend Development',
      skills: ['Java', 'Node.js', 'Spring Boot', 'MySQL', 'PostgreSQL'],
    },
    {
      title: 'Other',
      skills: [
              'Full-Stack Architecture & System Design',
              'RESTful API Engineering & Integration',
              'Relational Database Modeling & Query Optimization',
              'State Management & Reactive Programming',
              'Software Security, Auth (OAuth2/JWT) & Form Validation',
              'Version Control (Git) & Automated CI/CD Deployment',
              'Agile Software Development & Domain-Driven Design',
            ],
    },
  ];

  private readonly experiences: Experience[] = [
    {
      period: '06/2026 – Present',
      location: 'Addis Ababa, Ethiopia',
      company: 'Bunna Bank',
      role: 'Frontend Developer',
      description:
        'Building highly responsive web and cross-platform mobile applications using React, Angular, and Flutter. Integrating with Java Spring Boot backends for secure, scalable digital banking solutions.',
    },
    {
      period: '05/2025 – 06/2026',
      location: 'Addis Ababa',
      company: 'Blata Technology Group',
      role: 'Software Developer',
      description:
        'Led development on the Blata Technology website (React, Node.js, PostgreSQL) and worked as a Full-Stack Developer on the Atuye Market LLC project (Angular, Spring Boot, MySQL). Built RESTful APIs and delivered scalable web applications.',
    },
    {
      period: '06/2024 – 06/2025',
      location: 'Addis Ababa',
      company: 'Yegna Microfinance S.C',
      role: 'Junior Web Developer',
      description:
        'Handled customer inquiries and service operations while administering web platforms, updating content, and resolving technical issues.',
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
      role: 'Frontend Developer',
      stack: 'Angular 17+, TypeScript, RxJS, SCSS, Spring Boot, REST APIs',
      points: [
        'Architected modular, domain-driven Angular standalone component structures for real-time transaction batching and automated reconciliation.',
        'Engineered dynamic dashboard interfaces featuring real-time settlement monitoring, interactive transaction filters, and audit trail logs.',
        'Integrated core frontend application modules with secure, enterprise-grade REST APIs built on Java Spring Boot.',
        'Implemented robust reactive form validation and guard strategies to safeguard batch execution and prevent corrupt data submissions.',
        'Optimized state management and rendering performance for high-volume financial data tables and third-party integration workspaces.',
      ],
    },
    {
      period: '10/2025 – Present',
      title: 'Atuye Market LLC – Financial Analytics Platform',
      role: 'Full-Stack Developer',
      stack: 'Angular, TypeScript, Spring Boot, MySQL, REST APIs',
      points: [
        'Engineered an end-to-end web application providing real-time financial tracking and market analytics dashboards.',
        'Integrated external market APIs (Finnhub) with custom Spring Boot RESTful services for automated data synchronization.',
        'Designed relational database schemas and optimized complex MySQL query performance for efficient reporting.',
        'Delivered responsive, component-driven user interfaces using Angular standalone architecture and modern styling.',
      ],
    },
    {
      period: '05/2025 – 10/2025',
      title: 'Blata Technology Group Website',
      role: 'Full-Stack Developer',
      stack: 'React, Node.js, PostgreSQL',
      points: [
        'Developed and deployed a responsive company website.',
        'Built and integrated RESTful APIs for seamless communication.',
        'Designed and optimized database schemas and queries.',
        'Improved performance, usability, and maintainability through clean code.',
      ],
    },
  ];

  private readonly certificates: string[] = [
    'Artificial Intelligence — Udacity',
    'Android Developer Fundamentals — Udacity',
    'Digital Customer Onboarding — Bunna Bank',
    'Job Employability Skills — Dereja.com',
  ];

  getProfile(): Profile {
    return this.profile;
  }

  getSkillGroups(): SkillGroup[] {
    return this.skillGroups;
  }

  getExperiences(): Experience[] {
    return this.experiences;
  }

  getEducation(): Education[] {
    return this.education;
  }

  getProjects(): Project[] {
    return this.projects;
  }

  getCertificates(): string[] {
    return this.certificates;
  }
}