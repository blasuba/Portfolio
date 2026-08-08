import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioService } from './services/portfolio.service';
import {
  Profile,
  SkillGroup,
  Experience,
  Education,
  Project,
} from './models/portfolio.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  profile!: Profile;
  skillGroups: SkillGroup[] = [];
  experiences: Experience[] = [];
  education: Education[] = [];
  projects: Project[] = [];
  certificates: string[] = [];
  currentYear = new Date().getFullYear();

  constructor(private readonly portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.profile = this.portfolioService.getProfile();
    this.skillGroups = this.portfolioService.getSkillGroups();
    this.experiences = this.portfolioService.getExperiences();
    this.education = this.portfolioService.getEducation();
    this.projects = this.portfolioService.getProjects();
    this.certificates = this.portfolioService.getCertificates();
  }
}