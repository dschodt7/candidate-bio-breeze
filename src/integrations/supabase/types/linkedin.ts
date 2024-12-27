export type LinkedInSectionType = 
  | 'about'
  | 'experience_1'
  | 'experience_2'
  | 'experience_3'
  | 'skills'
  | 'recommendations';

export interface LinkedInSection {
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  section_type: LinkedInSectionType;
  content: string | null;
  analysis: Record<string, any> | null;
}