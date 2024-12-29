export interface ProfilesTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    first_name: string | null;
    last_name: string | null;
  };
  Insert: Partial<ProfilesTable['Row']> & Pick<ProfilesTable['Row'], 'id'>;
  Update: Partial<ProfilesTable['Row']>;
  Relationships: [];
}