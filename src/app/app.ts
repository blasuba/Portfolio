import {
  AfterViewInit, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewEncapsulation,
  afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import {
  AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';

import { IconComponent } from './icon.component';
import { ThreeSceneComponent } from './three-scene.component';
import { PortfolioService } from './services/portfolio.service';
import {
  Certificate, ContactLink, Education, Experience, Feature, NavLink, Profile, Project, ProjectFilter, Service, Skill, Stat,
} from './models/portfolio.model';

type ContactField = 'name' | 'email' | 'message';
export type Theme = 'light' | 'dark';

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
const DESKTOP_MIN_WIDTH = 1024;
const THEME_KEY = 'theme';

/** Safe media-query check: false where matchMedia is unavailable (e.g. test DOMs). */
const mediaMatches = (query: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

/** Requires at least `min` non-whitespace characters. */
const minTrimmedLength = (min: number): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null =>
    typeof control.value === 'string' && control.value.trim().length >= min ? null : { minTrimmed: { min } };

/** Saved theme, else the OS preference. */
export function initialTheme(saved: string | null, prefersDark: boolean): Theme {
  if (saved === 'light' || saved === 'dark') return saved;
  return prefersDark ? 'dark' : 'light';
}

/** Circumference of the back-to-top progress ring (r = 22). */
const RING_LENGTH = 2 * Math.PI * 22;

const LOADER_MS = 1600;
const LOADER_WORDS = ['Design', 'Build', 'Deliver'];
const INTRO_KEY = 'intro-seen';
const BENTO_PATTERN = [7, 5, 5, 7];

/**
 * Column span (of 12) for project card `index` in a list of `total`:
 * alternates 7/5 and 5/7, and an odd card out at the end spans the full row.
 */
/** How far the timeline line has "drawn": 0 until its top passes 65% of the viewport, 1 when its end does. */
export function timelineProgress(top: number, height: number, viewportHeight: number): number {
  if (height <= 0) return 1;
  return Math.min(1, Math.max(0, (viewportHeight * 0.65 - top) / height));
}

export function bentoSpan(index: number, total: number): number {
  if (total === 1 || (index === total - 1 && total % 2 === 1)) return 12;
  return BENTO_PATTERN[index % BENTO_PATTERN.length];
}

/** Formats a counter value with fixed decimals and a suffix, e.g. 3 → "3+", 3.66 → "3.66". */
export function formatStat(value: number, decimals: number, suffix: string): string {
  return value.toFixed(decimals) + suffix;
}

/**
 * Root component. The app is zoneless: template state lives in signals, and
 * high-frequency scroll work writes to the DOM inside a rAF so it never
 * triggers change detection on its own.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ThreeSceneComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  private readonly portfolio = inject(PortfolioService);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly modalRef = viewChild<ElementRef<HTMLElement>>('modal');
  private readonly progressRef = viewChild<ElementRef<HTMLElement>>('progress');
  private readonly timelineRef = viewChild<ElementRef<HTMLElement>>('timeline');
  private readonly statsRef = viewChild<ElementRef<HTMLElement>>('statsBlock');
  private readonly menuButtonRef = viewChild<ElementRef<HTMLElement>>('menuButton');
  private readonly ringRef = viewChild<ElementRef<SVGCircleElement>>('ring');

  // ─────────────────────────── Content ───────────────────────────
  readonly profile: Profile = this.portfolio.getProfile();
  readonly skills: Skill[] = this.portfolio.getSkills();
  readonly highlights: Feature[] = this.portfolio.getHighlights();
  readonly services: Service[] = this.portfolio.getServices();
  readonly values: Feature[] = this.portfolio.getValues();
  readonly stats: Stat[] = this.portfolio.getStats();
  readonly experiences: Experience[] = this.portfolio.getExperiences();
  readonly education: Education[] = this.portfolio.getEducation();
  readonly certificates: Certificate[] = this.portfolio.getCertificates();
  readonly projects: Project[] = this.portfolio.getProjects();
  readonly projectFilters: ProjectFilter[] = this.portfolio.getProjectFilters();
  readonly contactLinks: ContactLink[] = this.portfolio.getContactLinks();
  readonly socialLinks: ContactLink[] = this.contactLinks.filter((link) => link.external);
  readonly clients: string[] = this.portfolio.getClients();
  readonly currentRole: Experience = this.experiences[0];
  readonly currentYear = new Date().getFullYear();
  /** Tech strip content, doubled so the CSS marquee loops seamlessly. */
  readonly techStrip: Skill[] = [...this.skills, ...this.skills];
  /** Contact marquee phrase repetitions (the track is translated by -50% for a seamless loop). */
  readonly marqueeRepeats = Array.from({ length: 6 });
  readonly bentoSpan = bentoSpan;

  // ─────────────────────────── Intro loader & hero role rotator ───────────────────────────
  readonly loading = signal(false);
  readonly loaderDone = signal(false);
  readonly loaderProgress = signal(0);
  readonly loaderCount = computed(() => String(Math.round(this.loaderProgress() * 100)).padStart(3, '0'));
  readonly loaderWord = signal(LOADER_WORDS[0]);
  readonly roleWords = ['Full-Stack', 'Frontend', 'Spring Boot', 'Flutter'];
  readonly roleWord = signal(this.roleWords[0]);
  private loaderFrame: number | undefined;
  private loaderTimer: ReturnType<typeof setTimeout> | undefined;
  private roleTimer: ReturnType<typeof setInterval> | undefined;

  readonly navLinks: NavLink[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ];

  // ─────────────────────────── Header, theme & navigation ───────────────────────────
  readonly theme = signal<Theme>('dark');
  readonly isScrolled = signal(false);
  readonly activeSection = signal('home');
  readonly showBackToTop = signal(false);
  readonly menuOpen = signal(false);

  // ─────────────────────────── About counters ───────────────────────────
  readonly statDisplay = signal<string[]>(this.stats.map((s) => formatStat(0, s.decimals, s.suffix)));

  // ─────────────────────────── Projects ───────────────────────────
  readonly activeFilter = signal<ProjectFilter>('All');
  readonly selectedProject = signal<Project | null>(null);
  readonly visibleProjects = computed(() => {
    const filter = this.activeFilter();
    return filter === 'All' ? this.projects : this.projects.filter((p) => p.category === filter);
  });
  /** Position of the open project within the current filter, for the modal's prev/next. */
  readonly modalPosition = computed(() => {
    const current = this.selectedProject();
    const list = this.visibleProjects();
    return { index: current ? list.findIndex((p) => p.id === current.id) : -1, total: list.length };
  });
  private lastFocused: HTMLElement | null = null;

  // ─────────────────────────── Contact ───────────────────────────
  readonly contactForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, minTrimmedLength(2)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, minTrimmedLength(10)] }),
  });
  readonly submitAttempted = signal(false);
  readonly draftOpened = signal(false);
  readonly toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly contactMessages: Record<ContactField, Record<string, string>> = {
    name: { required: 'Please enter your name.', minTrimmed: 'Name should be at least 2 characters.' },
    email: { required: 'Please enter your email address.', email: 'Please enter a valid email address.' },
    message: { required: 'Please write a short message.', minTrimmed: 'Message should be at least 10 characters.' },
  };

  // ─────────────────────────── Observers & scroll ───────────────────────────
  private readonly reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');
  private readonly finePointer = mediaMatches('(hover: hover) and (pointer: fine)');
  private readonly observers: IntersectionObserver[] = [];
  private frame: number | undefined;
  private counterFrame: number | undefined;
  private pointerFrame: number | undefined;
  private pointer: PointerEvent | null = null;
  private tiltEl: HTMLElement | null = null;

  /** Card spotlight pointer effect, throttled to one update per frame. */
  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointer = event;
    if (this.pointerFrame !== undefined) return;
    this.pointerFrame = requestAnimationFrame(() => {
      this.pointerFrame = undefined;
      if (this.pointer) this.updatePointerEffects(this.pointer);
    });
  };

  private readonly onScrollFrame = (): void => {
    if (this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      this.updateScrollState();
    });
  };

  ngOnInit(): void {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {
      saved = null;
    }
    this.theme.set(initialTheme(saved, mediaMatches('(prefers-color-scheme: dark)')));
    this.applyTheme();
    this.startLoader();
  }

  ngAfterViewInit(): void {
    this.initReveal();
    this.initCounters();
    window.addEventListener('scroll', this.onScrollFrame, { passive: true });
    if (this.finePointer && !this.reducedMotion) {
      document.addEventListener('pointermove', this.onPointerMove, { passive: true });
    }
    if (!this.reducedMotion) {
      let i = 0;
      this.roleTimer = setInterval(() => {
        i = (i + 1) % this.roleWords.length;
        this.roleWord.set(this.roleWords[i]);
      }, 2200);
    }
    this.updateScrollState();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
    clearTimeout(this.loaderTimer);
    clearInterval(this.roleTimer);
    if (this.loaderFrame !== undefined) cancelAnimationFrame(this.loaderFrame);
    document.documentElement.classList.remove('is-loading');
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    if (this.counterFrame !== undefined) cancelAnimationFrame(this.counterFrame);
    if (this.pointerFrame !== undefined) cancelAnimationFrame(this.pointerFrame);
    this.observers.forEach((observer) => observer.disconnect());
    window.removeEventListener('scroll', this.onScrollFrame);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.body.classList.remove('no-scroll');
  }

  // ─────────────────────────── Theme ───────────────────────────

  toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
    this.applyTheme();
    try {
      localStorage.setItem(THEME_KEY, this.theme());
    } catch {
      // Storage blocked (private mode): the theme still applies for this visit.
    }
  }

  private applyTheme(): void {
    document.documentElement.dataset['theme'] = this.theme();
  }

  // ─────────────────────────── Scroll state ───────────────────────────

  private updateScrollState(): void {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    const timeline = this.timelineRef()?.nativeElement;
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const drawn = this.reducedMotion ? 1 : timelineProgress(rect.top, rect.height, window.innerHeight);
      timeline.style.setProperty('--progress', drawn.toFixed(3));
    }

    const progress = max > 0 ? Math.min(1, y / max) : 0;
    const bar = this.progressRef()?.nativeElement;
    if (bar) bar.style.transform = `scaleX(${progress})`;
    const ring = this.ringRef()?.nativeElement;
    if (ring) ring.style.strokeDashoffset = String(RING_LENGTH * (1 - progress));

    if (this.isScrolled() !== y > 8) this.isScrolled.set(y > 8);
    if (this.showBackToTop() !== y > 700) this.showBackToTop.set(y > 700);

    // Scroll-spy: the last section whose top has passed a line 35% down the viewport.
    const line = window.innerHeight * 0.35;
    let active = this.navLinks[0].id;
    for (const link of this.navLinks) {
      const el = document.getElementById(link.id);
      if (el && el.getBoundingClientRect().top <= line) active = link.id;
    }
    if (y >= max - 4) active = this.navLinks.at(-1)?.id ?? active;
    if (this.activeSection() !== active) this.activeSection.set(active);
  }

  // ─────────────────────────── Intro loader ───────────────────────────

  /**
   * Short 000→100 intro shown once per browser session. Skipped under reduced motion,
   * and the visitor can click anywhere to dismiss it early.
   */
  private startLoader(): void {
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === '1';
    } catch {
      seen = true; // storage blocked: don't risk showing it on every page load
    }
    if (seen || this.reducedMotion || typeof requestAnimationFrame !== 'function') return;

    this.loading.set(true);
    document.documentElement.classList.add('is-loading');
    const start = performance.now();
    const tick = (now: number): void => {
      if (this.loaderDone()) return;
      const t = Math.min(1, (now - start) / LOADER_MS);
      this.loaderProgress.set(t);
      this.loaderWord.set(LOADER_WORDS[Math.min(LOADER_WORDS.length - 1, Math.floor(t * LOADER_WORDS.length))]);
      if (t < 1) {
        this.loaderFrame = requestAnimationFrame(tick);
      } else {
        this.loaderTimer = setTimeout(() => this.finishLoader(), 250);
      }
    };
    this.loaderFrame = requestAnimationFrame(tick);
  }

  finishLoader(): void {
    if (!this.loading() || this.loaderDone()) return;
    if (this.loaderFrame !== undefined) cancelAnimationFrame(this.loaderFrame);
    clearTimeout(this.loaderTimer);
    this.loaderProgress.set(1);
    this.loaderDone.set(true);
    document.documentElement.classList.remove('is-loading');
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // ignore: the intro simply shows again next visit
    }
    this.loaderTimer = setTimeout(() => this.loading.set(false), 600);
  }

  // ─────────────────────────── Pointer effects ───────────────────────────

  private updatePointerEffects(event: PointerEvent): void {
    // Spotlight: a soft glow that follows the cursor inside any `.spotlight` card.
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.spotlight') : null;
    if (target) {
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      target.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }

    // 3D tilt: `.tilt` cards lean toward the cursor (max ±6°) and settle back when it leaves.
    const tilt = event.target instanceof Element ? event.target.closest<HTMLElement>('.tilt') : null;
    if (this.tiltEl && this.tiltEl !== tilt) {
      this.tiltEl.style.removeProperty('--rx');
      this.tiltEl.style.removeProperty('--ry');
    }
    if (tilt) {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tilt.style.setProperty('--rx', `${(x * 12).toFixed(2)}deg`);
      tilt.style.setProperty('--ry', `${(-y * 12).toFixed(2)}deg`);
    }
    this.tiltEl = tilt;

  }

  // ─────────────────────────── Reveal & counters ───────────────────────────

  /**
   * Fades `.reveal` elements in as they enter the viewport. They are only hidden once
   * the observer is armed (html.reveal-ready), so nothing stays invisible without
   * IntersectionObserver or under reduced motion.
   */
  private initReveal(): void {
    if (typeof IntersectionObserver === 'undefined' || this.reducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    this.host.nativeElement.querySelectorAll('.reveal, .reveal-group').forEach((el) => observer.observe(el));
    document.documentElement.classList.add('reveal-ready');
    this.observers.push(observer);
  }

  /** Counts the About stats up from zero the first time they scroll into view. */
  private initCounters(): void {
    const el = this.statsRef()?.nativeElement;
    if (!el || typeof IntersectionObserver === 'undefined' || this.reducedMotion) {
      this.setStatProgress(1);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number): void => {
        const t = Math.min(1, (now - start) / duration);
        this.setStatProgress(1 - Math.pow(1 - t, 3)); // ease-out cubic
        if (t < 1) this.counterFrame = requestAnimationFrame(tick);
      };
      this.counterFrame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    this.observers.push(observer);
  }

  private setStatProgress(progress: number): void {
    this.statDisplay.set(this.stats.map((s) => formatStat(s.value * progress, s.decimals, s.suffix)));
  }

  // ─────────────────────────── Projects ───────────────────────────

  setFilter(filter: ProjectFilter): void {
    this.activeFilter.set(filter);
  }

  countFor(filter: ProjectFilter): number {
    return filter === 'All' ? this.projects.length : this.projects.filter((p) => p.category === filter).length;
  }

  openProject(project: Project): void {
    const active = document.activeElement;
    this.lastFocused = active instanceof HTMLElement ? active : null;
    this.selectedProject.set(project);
    document.body.classList.add('no-scroll');
    afterNextRender(
      () => this.modalRef()?.nativeElement.querySelector<HTMLElement>('.modal__close')?.focus(),
      { injector: this.injector },
    );
  }

  closeProject(): void {
    if (!this.selectedProject()) return;
    this.selectedProject.set(null);
    if (!this.menuOpen()) document.body.classList.remove('no-scroll');
    this.lastFocused?.focus();
    this.lastFocused = null;
  }

  /** Moves to the previous/next project in the current filter, wrapping around. */
  stepProject(delta: 1 | -1): void {
    const { index, total } = this.modalPosition();
    if (index < 0 || total < 2) return;
    this.selectedProject.set(this.visibleProjects()[(index + delta + total) % total]);
    const modal = this.modalRef()?.nativeElement;
    if (modal) modal.scrollTop = 0;
  }

  isCurrentRole(experience: Experience): boolean {
    return experience.period.includes('Present');
  }

  // ─────────────────────────── Contact ───────────────────────────

  showContactError(field: ContactField): boolean {
    const control = this.contactForm.controls[field];
    return control.invalid && (control.touched || control.dirty || this.submitAttempted());
  }

  contactError(field: ContactField): string {
    const errors = this.contactForm.controls[field].errors ?? {};
    const key = Object.keys(errors)[0];
    return (key && this.contactMessages[field][key]) || 'Please check this field.';
  }

  submitContact(): void {
    this.submitAttempted.set(true);
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('.contact-form .ng-invalid:not(form)')?.focus();
      return;
    }
    const { name, email, message } = this.contactForm.getRawValue();
    const subject = `Portfolio enquiry from ${name.trim()}`;
    const body = `${message.trim()}\n\n— ${name.trim()}\nReply to: ${email.trim()}`;
    window.location.href =
      `mailto:${this.profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.draftOpened.set(true);
  }

  async copyEmail(): Promise<void> {
    const copied = await this.writeClipboard(this.profile.email);
    this.showToast(copied ? 'Email address copied' : `Copy failed — my email is ${this.profile.email}`);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2600);
  }

  private async writeClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to the legacy path (insecure context or denied permission).
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = typeof document.execCommand === 'function' && document.execCommand('copy');
    } catch {
      ok = false;
    }
    textarea.remove();
    return ok;
  }

  // ─────────────────────────── Navigation & keyboard ───────────────────────────

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.menuOpen.set(true);
      document.body.classList.add('no-scroll');
    }
  }

  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (!this.selectedProject()) document.body.classList.remove('no-scroll');
    if (restoreFocus) this.menuButtonRef()?.nativeElement.focus();
  }

  scrollToSection(id: string): void {
    this.closeMenu();
    document.getElementById(id)?.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: this.reducedMotion ? 'auto' : 'smooth' });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.selectedProject()) this.closeProject();
      else this.closeMenu(true);
      return;
    }
    if (!this.selectedProject()) return;
    if (event.key === 'ArrowRight') this.stepProject(1);
    else if (event.key === 'ArrowLeft') this.stepProject(-1);
    else if (event.key === 'Tab') this.trapFocus(event);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= DESKTOP_MIN_WIDTH) this.closeMenu();
  }

  /** Keeps keyboard focus inside the open modal. */
  private trapFocus(event: KeyboardEvent): void {
    const modal = this.modalRef()?.nativeElement;
    if (!modal) return;
    const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1) ?? first;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !modal.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !modal.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }
}
