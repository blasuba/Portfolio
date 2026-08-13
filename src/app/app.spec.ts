import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should validate invalid email before submit', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.profile = {
      name: 'Esubalew',
      title: 'Software Developer',
      location: 'Addis Ababa',
      email: 'esubalew.gashiaw@gmail.com',
      phone: '+251-965496587',
      linkedin: 'linkedin.com/in/esubalew-gashaw',
      about: 'Test profile',
      manifesto: 'Test manifesto',
      availability: 'Available',
      responsePromise: 'I usually reply within 24 hours',
      photo: '/assets/images/esuba.jpg',
    };

    app.contact = {
      name: 'Esubalew',
      email: 'bad-email',
      message: 'Hello, this is a valid message.',
    };

    app.submitContactForm();

    expect(app.contactErrors.email).toContain('valid email');
    expect(app.contactSubmitted).toBe(true);
    expect(app.submitSuccess).toBe(false);
  });

  it('should allow a valid submit to open mailto', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.profile = {
      name: 'Esubalew',
      title: 'Software Developer',
      location: 'Addis Ababa',
      email: 'esubalew.gashiaw@gmail.com',
      phone: '+251-965496587',
      linkedin: 'linkedin.com/in/esubalew-gashaw',
      about: 'Test profile',
      manifesto: 'Test manifesto',
      availability: 'Available',
      responsePromise: 'I usually reply within 24 hours',
      photo: '/assets/images/esuba.jpg',
    };

    app.contact = {
      name: 'Esubalew',
      email: 'esubalew.gashiaw@gmail.com',
      message: 'I would like to discuss a project opportunity.',
    };

    const originalHref = window.location.href;
    Object.defineProperty(window, 'location', {
      value: { href: originalHref },
      writable: true,
    });

    app.submitContactForm();

    expect(app.contactErrors.name).toBe('');
    expect(app.contactErrors.email).toBe('');
    expect(app.contactErrors.message).toBe('');
    expect(app.submitSuccess).toBe(true);
    expect(window.location.href).toContain('mailto:');
  });
});
