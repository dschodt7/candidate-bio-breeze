export interface CandidatesTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    profile_id: string;
    linkedin_url: string | null;
    screening_notes: string | null;
    resume_path: string | null;
  };
  Insert: Partial<CandidatesTable['Row']> & Pick<CandidatesTable['Row'], 'profile_id'>;
  Update: Partial<CandidatesTable['Row']>;
  Relationships: [
    {
      foreignKeyName: "candidates_profile_id_fkey";
      columns: ["profile_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    }
  ];
}