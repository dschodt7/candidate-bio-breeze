import { Json } from './json';

export interface ExecutiveSummariesTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    candidate_id: string;
    brass_tax_criteria: Json;
    sensory_criteria: Json;
    linkedin_about: string | null;
    credibility_submitted: boolean;
  };
  Insert: Partial<Omit<ExecutiveSummariesTable['Row'], 'candidate_id'>> & { candidate_id: string };
  Update: Partial<ExecutiveSummariesTable['Row']>;
  Relationships: [
    {
      foreignKeyName: "executive_summaries_candidate_id_fkey";
      columns: ["candidate_id"];
      isOneToOne: false;
      referencedRelation: "candidates";
      referencedColumns: ["id"];
    }
  ];
}