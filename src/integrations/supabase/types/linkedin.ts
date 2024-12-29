import { Json } from './json';

export type LinkedInSectionType =
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "experience_1"
  | "experience_2"
  | "experience_3"
  | "recommendations";

export interface LinkedInSectionsTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    candidate_id: string;
    section_type: LinkedInSectionType;
    content: string | null;
    analysis: Json | null;
  };
  Insert: Partial<LinkedInSectionsTable['Row']> & Pick<LinkedInSectionsTable['Row'], 'candidate_id' | 'section_type'>;
  Update: Partial<LinkedInSectionsTable['Row']>;
  Relationships: [
    {
      foreignKeyName: "linkedin_sections_candidate_id_fkey";
      columns: ["candidate_id"];
      isOneToOne: false;
      referencedRelation: "candidates";
      referencedColumns: ["id"];
    }
  ];
}