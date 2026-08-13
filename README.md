# Esubalew Gashaw Portfolio

A modern Angular portfolio for Esubalew Gashaw, showcasing software development experience, projects, skills, education, and contact information.

## Overview

This portfolio includes:

- premium landing page hero section
- about and skills overview
- process/workflow section
- work experience timeline
- project cards and modal details
- education and certificate highlights
- contact section with validation and mailto integration
- dark/light theme toggle
- responsive design for mobile and desktop

## Tech Stack

- Angular 21
- TypeScript
- SCSS
- Angular Forms
- Vitest via Angular test runner

## Project Structure

```bash
src/
  app/
    app.ts
    app.html
    app.scss
    app.spec.ts
    models/
    services/
  assets/
    images/
    esubalew-resume.pdf
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
ng serve
```

Then open:

```bash
http://localhost:4200/
```

## Build for production

```bash
ng build
```

## Run tests

```bash
npx ng test --watch=false
```

## Contact form behavior

The contact section validates user input before opening the user’s default mail app with a prefilled message to:

```text
esubalew.gashiaw@gmail.com
```

This is a frontend portfolio pattern and does not require a backend email service.

## Deployment

This project is ready to deploy on any static hosting service compatible with Angular build output, including:

- Netlify
- Vercel
- Firebase Hosting
- GitHub Pages

## Author

Esubalew Gashaw Admas
