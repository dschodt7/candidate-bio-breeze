export type LinkedInSectionType = 'about' | 'experience' | 'education' | 'skills' | 'certifications';

export interface LinkedInSection {
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  section_type: LinkedInSectionType;
  content: string | null;
  analysis: Record<string, any> | null;
}