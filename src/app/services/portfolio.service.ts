import { Injectable } from '@angular/core';
import {
  Certificate, ContactLink, Education, Experience, Feature, Profile, Project, ProjectFilter, Service, Skill, Stat,
} from '../models/portfolio.model';

/** All portfolio content lives here, so copy can be edited without touching the layout. */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly profile: Profile = {
    name: 'Esubalew Gashaw Admass',
    firstName: 'Esubalew',
    title: 'Full-Stack Developer',
    location: 'Addis Ababa, Ethiopia',
    email: 'esubalew.gashiaw@gmail.com',
    phone: '+251-965496587',
    linkedin: 'linkedin.com/in/esubalew-gashaw',
    github: 'github.com/blasuba',
    telegram: 't.me/blasuba',
    about:
      'Results-driven software developer with hands-on experience building responsive web and cross-platform mobile applications. Proficient in React, Angular, and Flutter, with strong backend integration skills using Java Spring Boot.',
    manifesto:
      "I don't just write code — I build things people trust with their money, their data, and their time. That's why I care as much about a clean API contract as I do about a pixel-perfect button.",
    availability: 'Available for freelance & full-time work',
    responsePromise: 'I typically reply within 24 hours',
    cutout: '/assets/images/esuba-cutout.webp',
    resumeUrl: '/assets/esubalew_resume.pdf',
  };

  private readonly skills: Skill[] = [
    { name: 'Angular', icon: '🅰️', category: 'Frontend' },
    { name: 'React', icon: '⚛️', category: 'Frontend' },
    { name: 'TypeScript', icon: '📘', category: 'Frontend' },
    { name: 'JavaScript', icon: '⚡', category: 'Frontend' },
    { name: 'RxJS', icon: '🔁', category: 'Frontend' },
    { name: 'Spring Boot', icon: '🍃', category: 'Backend' },
    { name: 'Java', icon: '☕', category: 'Backend' },
    { name: 'Node.js', icon: '🟢', category: 'Backend' },
    { name: 'REST APIs', icon: '🔗', category: 'Backend' },
    { name: 'MySQL', icon: '🗄️', category: 'Data' },
    { name: 'PostgreSQL', icon: '🐘', category: 'Data' },
    { name: 'Redis', icon: '🧠', category: 'Data' },
    { name: 'Flutter', icon: '📱', category: 'Mobile & Tools' },
    { name: 'Git', icon: '📦', category: 'Mobile & Tools' },
  ];

  private readonly highlights: Feature[] = [
    {
      number: '01',
      icon: 'shield',
      title: 'Banking-grade quality',
      description: 'Validation, guards, and audit-ready flows built for banking and healthcare systems.',
    },
    {
      number: '02',
      icon: 'layers',
      title: 'End-to-end delivery',
      description: 'From database schema to deployed UI — fewer hand-offs and faster releases.',
    },
    {
      number: '03',
      icon: 'code',
      title: 'Clean, scalable code',
      description: 'Modular Angular and Spring Boot architecture that stays easy to extend.',
    },
  ];

  private readonly services: Service[] = [
    {
      icon: 'code',
      name: 'Frontend Development',
      description: 'Responsive, accessible interfaces in Angular and React — from data-heavy dashboards to fast marketing sites.',
    },
    {
      icon: 'server',
      name: 'Backend & APIs',
      description: 'Secure REST APIs and business logic with Java Spring Boot and Node.js that integrate with your existing systems.',
    },
    {
      icon: 'layers',
      name: 'Full-Stack Web Apps',
      description: 'Complete products from schema to UI, so one developer owns the whole flow and nothing gets lost between teams.',
    },
    {
      icon: 'smartphone',
      name: 'Mobile Apps',
      description: 'Cross-platform Flutter apps that share logic and branding with your web platform.',
    },
    {
      icon: 'database',
      name: 'Database Design',
      description: 'Relational schemas, query tuning, and caching with MySQL, PostgreSQL, and Redis.',
    },
    {
      icon: 'cloud',
      name: 'Deployment & Maintenance',
      description: 'Deploying, monitoring, and maintaining live platforms so they keep running smoothly after launch.',
    },
  ];

  private readonly values: Feature[] = [
    {
      number: '01',
      icon: 'target',
      title: 'Business-first thinking',
      description: 'I focus on outcomes, not just code — making sure the product solves real problems for real users.',
    },
    {
      number: '02',
      icon: 'layers',
      title: 'Full-stack clarity',
      description: 'I understand both UI and backend behaviour, which reduces delays, bugs, and communication gaps.',
    },
    {
      number: '03',
      icon: 'shield',
      title: 'Reliable delivery',
      description: 'Maintainable systems with a clean structure, strong validation, and a practical workflow.',
    },
    {
      number: '04',
      icon: 'trendingUp',
      title: 'Long-term value',
      description: 'Architecture that can grow — not short-term patches that create future technical debt.',
    },
  ];

  private readonly experiences: Experience[] = [
    {
      period: '07/2026 – Present',
      location: 'Addis Ababa, Ethiopia',
      company: 'Bunna Bank',
      role: 'Frontend Developer',
      description:
        'Building highly responsive web and cross-platform mobile applications using React, Angular, and Flutter, integrated with Java Spring Boot backends for secure, scalable digital banking.',
    },
    {
      period: '05/2025 – 07/2026',
      location: 'Addis Ababa, Ethiopia',
      company: 'Blata Technology Group',
      role: 'Software Developer',
      description:
        'Led development of the Blata Technology website (React, Node.js, PostgreSQL) and worked as full-stack developer on the Atuye Market platform (Angular, Spring Boot, MySQL).',
    },
    {
      period: '06/2024 – 06/2025',
      location: 'Addis Ababa, Ethiopia',
      company: 'Yegna Microfinance S.C',
      role: 'Junior Web Developer',
      description:
        'Administered web platforms, resolved technical issues, and supported customer service operations.',
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

  private readonly certificates: Certificate[] = [
    { name: 'Artificial Intelligence', issuer: 'Udacity' },
    { name: 'Android Developer Fundamentals', issuer: 'Udacity' },
    { name: 'Job Employability Skills', issuer: 'Dereja' },
  ];

  private readonly projectFilters: ProjectFilter[] = ['All', 'Fintech & Banking', 'Healthcare & Enterprise', 'Full-Stack Web'];

  private readonly projects: Project[] = [
    {
      id: 'loyalty-rewards',
      period: '2025 – Present',
      title: 'Enterprise Loyalty & Rewards Platform',
      role: 'Full-Stack Developer / Frontend Lead',
      category: 'Fintech & Banking',
      summary: 'Points, tiers, and QR vouchers for multi-branch merchants, with real-time settlement analytics.',
      description:
        'Omni-channel customer loyalty platform with real-time points accrual, tiered rewards (Bronze to Platinum), digital QR vouchers, and merchant settlement analytics.',
      impact: '45% faster checkout verification',
      tags: ['Angular', 'Spring Boot', 'Redis', 'PostgreSQL', 'RxJS'],
      image: '/assets/images/projects/loyalty-rewards.svg',
      featured: true,
      bullets: [
        'Architected an omni-channel loyalty portal with Angular 17 and Spring Boot for multi-tier reward accrual and redemption.',
        'Added Redis caching for point-balance reads, cutting cashier verification latency during peak hours by 45%.',
        'Built a voucher generator issuing encrypted single-use QR codes with real-time expiry validation.',
        'Delivered admin dashboards for retention, burn-vs-earn ratios, and merchant settlement balances.',
      ],
    },
    {
      id: 'pharmacare-os',
      period: '2024 – 2025',
      title: 'Smart Pharmacy & Healthcare System',
      role: 'Full-Stack Developer',
      client: 'Olantam Trading',
      category: 'Healthcare & Enterprise',
      summary: 'Pharmacy inventory, prescriptions, and POS with first-expired-first-out stock dispatching.',
      description:
        'Built for Olantam Trading: a clinical pharmacy automation and dispensary platform featuring First-Expired First-Out (FEFO) stock dispatching, prescription verification, and high-speed POS checkout.',
      impact: '30%+ less expired stock',
      tags: ['Angular', 'Spring Boot', 'MySQL', 'Chart.js'],
      image: '/assets/images/projects/pharmacare-os.svg',
      bullets: [
        'Automated medicine tracking and prescription dispensing with Angular and Java Spring Boot.',
        'Implemented a FEFO batch-dispatch algorithm that reduced expired-medication loss by over 30%.',
        'Built a touch-friendly POS with barcode scanning, split payments, and receipt printing.',
        'Added role-based access (Admin, Pharmacist, Cashier, Auditor) with immutable audit trails.',
      ],
    },
    {
      id: 'bunna-settlement',
      period: '07/2026 – Present',
      title: 'Bunna Bank Settlement Platform',
      role: 'Full-Stack Developer',
      category: 'Fintech & Banking',
      summary: 'Real-time transaction settlement and reconciliation dashboard for banking operations.',
      description:
        'Enterprise transaction settlement and integration management platform for real-time banking operations.',
      impact: 'Live settlement monitoring',
      tags: ['Angular', 'Spring Boot', 'TypeScript', 'RxJS'],
      image: '/assets/images/proj1.png',
      demoUrl: 'https://www.bunnabank.com',
      bullets: [
        'Structured domain-driven Angular standalone modules for transaction batching and automated reconciliation.',
        'Built real-time settlement dashboards with interactive filters and audit-trail logs.',
        'Integrated the frontend with secure, enterprise-grade Spring Boot REST APIs.',
        'Added reactive validation and route guards that prevent corrupt batch submissions.',
      ],
    },
    {
      id: 'atuye-market',
      period: '10/2025 – Present',
      title: 'Atuye Market',
      role: 'Full-Stack Developer',
      category: 'Full-Stack Web',
      summary: 'Marketplace platform built end-to-end, from database schema to the Angular front end.',
      description: 'Scalable marketplace platform with end-to-end web application development and database design.',
      impact: 'Built & deployed end-to-end',
      tags: ['Angular', 'Spring Boot', 'MySQL'],
      image: '/assets/images/atuye.png',
      bullets: [
        'Designed the database schema and built the REST APIs connecting front and back end.',
        'Developed a scalable, responsive Angular front end.',
        'Optimized queries and data structures for reliable data management.',
        'Deployed and maintain the platform in production.',
      ],
    },
    {
      id: 'blata-technology',
      period: '05/2025 – 10/2025',
      title: 'Blata Technology Website',
      role: 'Full-Stack Developer',
      category: 'Full-Stack Web',
      summary: 'Company website built from scratch with a React front end and PostgreSQL backend.',
      description: 'Company website built from scratch with a modern React stack and a PostgreSQL backend.',
      impact: 'Live in production',
      tags: ['React', 'Node.js', 'PostgreSQL'],
      image: '/assets/images/blata.png',
      demoUrl: 'https://blatatechnology.net',
      bullets: [
        'Developed and deployed a responsive company website from scratch.',
        'Built and integrated REST APIs between the front end and back end.',
        'Designed and optimized the PostgreSQL schema.',
        'Supported ongoing deployment, maintenance, and updates.',
      ],
    },
  ];

  getProfile(): Profile { return this.profile; }
  getSkills(): Skill[] { return this.skills; }
  getHighlights(): Feature[] { return this.highlights; }
  getServices(): Service[] { return this.services; }
  getValues(): Feature[] { return this.values; }
  getExperiences(): Experience[] { return this.experiences; }
  getEducation(): Education[] { return this.education; }
  getCertificates(): Certificate[] { return this.certificates; }
  getProjectFilters(): ProjectFilter[] { return this.projectFilters; }
  getProjects(): Project[] { return this.projects; }

  /** Organisations I've delivered work for (employers and client projects), shown under the hero. */
  getClients(): string[] {
    return ['Bunna Bank', 'Blata Technology Group', 'Olantam Trading', 'Atuye Market', 'Yegna Microfinance'];
  }

  getStats(): Stat[] {
    return [
      { value: 2, decimals: 0, suffix: '+', label: 'Years of experience' },
      { value: this.projects.length, decimals: 0, suffix: '+', label: 'Projects delivered' },
      { value: 10, decimals: 0, suffix: '+', label: 'Technologies' },
      { value: 3.66, decimals: 2, suffix: '', label: 'CGPA, B.Sc. IT' },
    ];
  }

  getContactLinks(): ContactLink[] {
    const p = this.profile;
    const links: ContactLink[] = [
      { icon: 'mail', label: 'Email', value: p.email, url: `mailto:${p.email}`, external: false },
      { icon: 'phone', label: 'Phone', value: p.phone, url: `tel:${p.phone}`, external: false },
      { icon: 'linkedin', label: 'LinkedIn', value: handle(p.linkedin), url: `https://${p.linkedin}`, external: true },
    ];
    if (p.github) links.push({ icon: 'github', label: 'GitHub', value: `@${handle(p.github)}`, url: `https://${p.github}`, external: true });
    if (p.telegram) links.push({ icon: 'telegram', label: 'Telegram', value: `@${handle(p.telegram)}`, url: `https://${p.telegram}`, external: true });
    return links;
  }
}

/** Last path segment of a profile URL, e.g. "github.com/blasuba" → "blasuba". */
export function handle(url: string): string {
  return url.split('/').filter(Boolean).pop() ?? url;
}
