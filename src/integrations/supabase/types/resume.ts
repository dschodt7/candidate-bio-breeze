export interface ResumeAnalysesTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    candidate_id: string;
    credibility_statements: string | null;
    case_studies: string | null;
    job_assessment: string | null;
    motivations: string | null;
    business_problems: string | null;
    additional_observations: string | null;
  };
  Insert: Partial<ResumeAnalysesTable['Row']> & Pick<ResumeAnalysesTable['Row'], 'candidate_id'>;
  Update: Partial<ResumeAnalysesTable['Row']>;
  Relationships: [
    {
      foreignKeyName: "resume_analyses_candidate_id_fkey";
      columns: ["candidate_id"];
      isOneToOne: false;
      referencedRelation: "candidates";
      referencedColumns: ["id"];
    }
  ];
}