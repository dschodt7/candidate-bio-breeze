export interface LinkedInAnalysis {
  credibilityStatements: string;
  caseStudies: string;
  jobAssessment: string;
  motivations: string;
  businessProblems: string;
  interests: string;
  activitiesAndHobbies: string;
  foundationalUnderstanding: string;
}

export const sections = [
  { key: 'credibilityStatements' as const, title: 'Credibility Statements' },
  { key: 'caseStudies' as const, title: 'Case Studies' },
  { key: 'jobAssessment' as const, title: 'Complete Assessment of Job' },
  { key: 'motivations' as const, title: 'Motivations' },
  { key: 'businessProblems' as const, title: 'Business Problems They Solve Better Than Most' },
  { key: 'interests' as const, title: 'Interests' },
  { key: 'activitiesAndHobbies' as const, title: 'Activities and Hobbies' },
  { key: 'foundationalUnderstanding' as const, title: 'Foundational Understanding' },
] as const;