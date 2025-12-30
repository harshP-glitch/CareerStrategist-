
export enum View {
  DASHBOARD = 'dashboard',
  RESUME_ANALYSIS = 'resume',
  CAREER_COACH = 'coach',
  SKILLS_INSIGHTS = 'skills',
  ROADMAP = 'roadmap',
  JOB_SEARCH = 'job_search',
  AUTOPILOT = 'autopilot',
  PROFILE = 'profile'
}

export type LogStatus = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  status: LogStatus;
  subTask?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { title: string; uri: string }[];
}

export interface ApplicationBundle {
  id: string;
  company: string;
  role: string;
  url: string;
  status: 'prepared' | 'visited';
  tailoredPitch: string;
  suggestedAnswers: { question: string, answer: string }[];
  matchReason: string;
  timestamp: Date;
}

export interface SkillScore {
  name: string;
  current: number;
  market: number;
}

export interface CareerPathNode {
  role: string;
  salaryRange: string;
  difficulty: number;
  description: string;
  keySkills: string[];
}

export interface ResumeReport {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  skillsFound: string[];
  suggestedRoles: string[];
}

export interface JobMarketTrend {
  title: string;
  summary: string;
  sources: { title: string; uri: string }[];
}
