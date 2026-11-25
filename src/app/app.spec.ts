import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { App, bentoSpan, formatStat, initialTheme, timelineProgress } from './app';
import { handle } from './services/portfolio.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  afterEach(() => {
    document.body.classList.remove('no-scroll');
  });

  function create() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return { fixture, app: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  describe('layout', () => {
    it('renders the hero headline and primary call to action', () => {
      const { el } = create();
      expect(el.querySelector('h1')?.textContent).toContain('people can trust');
      expect(el.querySelector('.hero .btn--primary')?.textContent).toContain('View My Work');
    });

    it('has a section for every nav link', () => {
      const { app, el } = create();
      expect(el.querySelectorAll('.header__nav a')).toHaveLength(app.navLinks.length);
      for (const link of app.navLinks) {
        expect(el.querySelector(`#${link.id}`)).not.toBeNull();
      }
    });

    it('renders six service cards and the three highlights', () => {
      const { el } = create();
      expect(el.querySelectorAll('.service-card')).toHaveLength(6);
      expect(el.querySelectorAll('.highlight')).toHaveLength(3);
    });

    it('shows every project with a summary and an impact line', () => {
      const { app, el } = create();
      const cards = el.querySelectorAll('.project-card');
      expect(cards).toHaveLength(app.projects.length);
      cards.forEach((card) => {
        expect(card.querySelector('.project-card__summary')?.textContent?.trim()).toBeTruthy();
        expect(card.querySelector('.project-card__impact')?.textContent?.trim()).toBeTruthy();
      });
    });

    it('lists every contact channel', () => {
      const { app, el } = create();
      expect(el.querySelectorAll('.contact-list__item')).toHaveLength(app.contactLinks.length);
    });
  });

  describe('theme', () => {
    it('toggles between light and dark and remembers the choice', () => {
      const { app } = create();
      const before = app.theme();
      app.toggleTheme();
      const after = app.theme();
      expect(after).not.toBe(before);
      expect(document.documentElement.dataset['theme']).toBe(after);
      expect(localStorage.getItem('theme')).toBe(after);
    });

    it('prefers a saved theme, otherwise follows the system', () => {
      expect(initialTheme('dark', false)).toBe('dark');
      expect(initialTheme('light', true)).toBe('light');
      expect(initialTheme(null, true)).toBe('dark');
      expect(initialTheme('bogus', false)).toBe('light');
    });
  });

  describe('mobile menu', () => {
    it('opens, locks page scroll, and closes on Escape', () => {
      const { app } = create();
      app.toggleMenu();
      expect(app.menuOpen()).toBe(true);
      expect(document.body.classList.contains('no-scroll')).toBe(true);

      app.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(app.menuOpen()).toBe(false);
      expect(document.body.classList.contains('no-scroll')).toBe(false);
    });
  });

  describe('projects', () => {
    it('filters to one category and updates the cards', () => {
      const { app, fixture, el } = create();
      app.setFilter('Healthcare & Enterprise');
      fixture.detectChanges();
      const visible = app.visibleProjects();
      expect(visible.every((p) => p.category === 'Healthcare & Enterprise')).toBe(true);
      expect(el.querySelectorAll('.project-card')).toHaveLength(visible.length);
    });

    it('gives every category filter at least one project', () => {
      const { app } = create();
      for (const category of app.projectFilters.filter((f) => f !== 'All')) {
        expect(app.countFor(category)).toBeGreaterThan(0);
      }
    });

    it('opens and closes the case-study modal, locking scroll while open', () => {
      const { app } = create();
      app.openProject(app.projects[0]);
      expect(app.selectedProject()).toBe(app.projects[0]);
      expect(document.body.classList.contains('no-scroll')).toBe(true);
      app.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(app.selectedProject()).toBeNull();
      expect(document.body.classList.contains('no-scroll')).toBe(false);
    });

    it('steps through projects with arrow keys and wraps around', () => {
      const { app } = create();
      const last = app.projects[app.projects.length - 1];
      app.openProject(last);
      app.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(app.selectedProject()).toBe(app.projects[0]);
      app.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(app.selectedProject()).toBe(last);
    });

    it('only steps through the active filter', () => {
      const { app } = create();
      app.setFilter('Full-Stack Web');
      const visible = app.visibleProjects();
      app.openProject(visible[0]);
      app.stepProject(1);
      expect(app.selectedProject()).toBe(visible[1]);
      expect(app.modalPosition()).toEqual({ index: 1, total: visible.length });
    });
  });

  describe('contact form', () => {
    it('does not open a mail draft while invalid', () => {
      const { app } = create();
      app.submitContact();
      expect(app.contactForm.invalid).toBe(true);
      expect(app.draftOpened()).toBe(false);
    });

    it('explains an invalid email', () => {
      const { app } = create();
      app.contactForm.controls.email.setValue('not-an-email');
      app.contactForm.controls.email.markAsTouched();
      expect(app.showContactError('email')).toBe(true);
      expect(app.contactError('email')).toBe('Please enter a valid email address.');
    });

    it('rejects whitespace-only names and accepts a complete message', () => {
      const { app } = create();
      app.contactForm.controls.name.setValue('   ');
      expect(app.contactForm.controls.name.valid).toBe(false);
      app.contactForm.setValue({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello, let us discuss a role.' });
      expect(app.contactForm.valid).toBe(true);
    });

    describe('copy email', () => {
      afterEach(() => Reflect.deleteProperty(navigator, 'clipboard'));

      it('copies the address and confirms with a toast', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
        const { app } = create();
        await app.copyEmail();
        expect(writeText).toHaveBeenCalledWith(app.profile.email);
        expect(app.toast()).toBe('Email address copied');
      });
    });
  });

  describe('helpers', () => {
    it('formats stats with fixed decimals and a suffix', () => {
      expect(formatStat(3, 0, '+')).toBe('3+');
      expect(formatStat(3.66, 2, '')).toBe('3.66');
      expect(formatStat(1.4, 0, '')).toBe('1');
    });

    it('shows final stat values when the counter cannot animate (no IntersectionObserver)', () => {
      const { app } = create();
      expect(app.statDisplay()).toEqual(['2+', `${app.projects.length}+`, '10+', '3.66']);
    });

    it('tiles bento project cards evenly for any filter size', () => {
      const spans = (n: number) => Array.from({ length: n }, (_, i) => bentoSpan(i, n));
      expect(spans(1)).toEqual([12]);
      expect(spans(2)).toEqual([7, 5]);
      expect(spans(3)).toEqual([7, 5, 12]);
      expect(spans(5)).toEqual([7, 5, 5, 7, 12]);
    });

    it('draws the timeline line as it scrolls through the viewport', () => {
      expect(timelineProgress(800, 1000, 1000)).toBe(0);
      expect(timelineProgress(150, 1000, 1000)).toBeCloseTo(0.5);
      expect(timelineProgress(-500, 1000, 1000)).toBe(1);
      expect(timelineProgress(0, 0, 1000)).toBe(1);
    });

    it('dismisses the intro loader and remembers it for the session', () => {
      sessionStorage.clear();
      const { app } = create();
      app.loading.set(true);
      app.finishLoader();
      expect(app.loaderDone()).toBe(true);
      expect(app.loaderCount()).toBe('100');
      expect(sessionStorage.getItem('intro-seen')).toBe('1');
      expect(document.documentElement.classList.contains('is-loading')).toBe(false);
    });

    it('extracts a handle from a profile URL', () => {
      expect(handle('github.com/blasuba')).toBe('blasuba');
      expect(handle('linkedin.com/in/esubalew-gashaw/')).toBe('esubalew-gashaw');
    });

    it('credits the pharmacy system to Olantam Trading', () => {
      const { app, el } = create();
      const pharmacy = app.projects.find((p) => p.id === 'pharmacare-os');
      expect(pharmacy?.client).toBe('Olantam Trading');
      expect(app.clients).toContain('Olantam Trading');
      expect(el.querySelector('.hero__trust-list')?.textContent).toContain('Olantam Trading');
    });

    it('marks only roles that run to the present as current', () => {
      const { app } = create();
      expect(app.experiences.filter((e) => app.isCurrentRole(e)).map((e) => e.company)).toEqual(['Bunna Bank']);
    });
  });
});
