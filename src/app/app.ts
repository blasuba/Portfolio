import { Component, OnInit, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PortfolioService } from './services/portfolio.service';
import {
  Profile, SkillGroup, Experience, Education, Project, Stat, ProcessStep, NavLink,
} from './models/portfolio.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, AfterViewInit {
  profile!: Profile;
  companies: string[] = [];
  stats: Stat[] = [];
  processSteps: ProcessStep[] = [];
  skillGroups: SkillGroup[] = [];
  experiences: Experience[] = [];
  education: Education[] = [];
  projects: Project[] = [];
  certificates: string[] = [];
  currentYear = new Date().getFullYear();

  navLinks: NavLink[] = [
    { id: 'about', label: 'About' },
    { id: 'process', label: 'Process' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ];

  activeSection = 'about';
  showBackToTop = false;
  isScrolled = false;
  isMobileMenuOpen = false;
  statsAnimated = false;
  animatedValues: number[] = [];
  theme: 'light' | 'dark' = 'light';

  projectFilters = ['all', 'Angular', 'React', 'Spring Boot'];
  selectedFilter = 'all';

  testimonials = [
    {
      quote: 'A developer who can bridge design thinking, backend integration, and reliable delivery without losing the user experience.',
      author: 'Working style',
    },
    {
      quote: 'Clear communication, practical problem solving, and a strong focus on building systems people can trust.',
      author: 'Delivery value',
    },
    {
      quote: 'Strong front-end craftsmanship combined with a backend mindset that keeps products stable, maintainable, and scalable.',
      author: 'Technical value',
    },
  ];

  hireReasons = [
    {
      title: 'Business-first thinking',
      description: 'I focus on outcomes, not just code — making sure the product solves real problems for real users.',
    },
    {
      title: 'Full-stack clarity',
      description: 'I understand both UI and backend behavior, which helps reduce delays, bugs, and communication gaps.',
    },
    {
      title: 'Reliable delivery',
      description: 'I build maintainable systems with a clean structure, strong validation, and a practical workflow.',
    },
    {
      title: 'Long-term value',
      description: 'I care about architecture that can grow, not short-term patches that create future technical debt.',
    },
  ];

  outcomeHighlights = [
    {
      value: '3+ years',
      title: 'Product-focused development',
      description: 'Building interfaces and systems with direct business value in mind, not just visual polish.',
    },
    {
      value: '4+ projects',
      title: 'From concept to delivery',
      description: 'Turning requirements into reliable front-end and full-stack solutions with clear execution.',
    },
    {
      value: '100%',
      title: 'Ownership mindset',
      description: 'I work across the stack, communicate clearly, and keep delivery practical and maintainable.',
    },
  ];

  contact = {
    name: '',
    email: '',
    message: '',
  };
  contactSubmitted = false;
  submitSuccess = false;
  contactErrors = {
    name: '',
    email: '',
    message: '',
  };
  selectedProject: Project | null = null;

  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly host: ElementRef,
  ) {}

  ngOnInit(): void {
    this.profile = this.portfolioService.getProfile();
    this.companies = this.portfolioService.getCompanies();
    this.stats = this.portfolioService.getStats();
    this.animatedValues = this.stats.map(() => 0);
    this.processSteps = this.portfolioService.getProcessSteps();
    this.skillGroups = this.portfolioService.getSkillGroups();
    this.experiences = this.portfolioService.getExperiences();
    this.education = this.portfolioService.getEducation();
    this.projects = this.portfolioService.getProjects();
    this.certificates = this.portfolioService.getCertificates();
  }

  ngAfterViewInit(): void {
    this.observeStats();
  }

  get filteredProjects(): Project[] {
    if (this.selectedFilter === 'all') {
      return this.projects;
    }

    const filter = this.selectedFilter.toLowerCase();

    return this.projects.filter((project) => {
      const stack = project.stack?.toLowerCase() ?? '';
      return stack.includes(filter);
    });
  }

  private observeStats(): void {
    const statsEl = this.host.nativeElement.querySelector('#stats-section');
    if (!statsEl || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.statsAnimated) {
            this.statsAnimated = true;
            this.animateStats();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(statsEl);
  }

  private animateStats(): void {
    const duration = 1200;
    const start = performance.now();
    const targets = this.stats.map((s) => s.value);

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.animatedValues = targets.map((t) => Math.round(t * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }

  filterProjects(filter: string): void {
    this.selectedFilter = filter;
  }

  openProject(project: Project): void {
    this.selectedProject = project;
  }

  closeProject(): void {
    this.selectedProject = null;
  }

  validateContactField(field: 'name' | 'email' | 'message'): void {
    const value = this.contact[field].trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (field === 'name') {
      this.contactErrors.name = value.length >= 2 ? '' : 'Please enter your full name.';
      return;
    }

    if (field === 'email') {
      this.contactErrors.email = emailPattern.test(value) ? '' : 'Please enter a valid email address.';
      return;
    }

    this.contactErrors.message = value.length >= 10 ? '' : 'Your message should be at least 10 characters long.';
  }

  submitContactForm(): void {
    const name = this.contact.name.trim();
    const email = this.contact.email.trim();
    const message = this.contact.message.trim();

    this.validateContactField('name');
    this.validateContactField('email');
    this.validateContactField('message');

    this.contactSubmitted = true;
    this.submitSuccess = false;

    if (!name || name.length < 2) {
      this.contactErrors.name = 'Please enter your full name.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.contactErrors.email = 'Please enter a valid email address.';
    }

    if (!message || message.length < 10) {
      this.contactErrors.message = 'Your message should be at least 10 characters long.';
    }

    if (this.contactErrors.name || this.contactErrors.email || this.contactErrors.message) {
      return;
    }

    const recipient = this.profile?.email ?? 'esubalew.gashiaw@gmail.com';
    const subject = encodeURIComponent('Portfolio Inquiry from ' + name);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );

    this.submitSuccess = true;
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    this.contact = { name: '', email: '', message: '' };
    this.contactErrors = { name: '', email: '', message: '' };
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showBackToTop = window.scrollY > 500;
    this.isScrolled = window.scrollY > 20;

    const scrollPos = window.scrollY + 120;
    for (const link of this.navLinks) {
      const el = document.getElementById(link.id);
      if (el) {
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          this.activeSection = link.id;
        }
      }
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}