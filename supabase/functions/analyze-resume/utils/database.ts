import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export const initializeSupabase = () => {
  console.log('[analyze-resume/database] Initializing Supabase client');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
};

export const processAnalysisContent = (content: string) => {
  console.log('[analyze-resume/database] Processing analysis content');
  
  const sections = {
    credibility_statements: '',
    case_studies: '',
    job_assessment: '',
    motivations: '',
    business_problems: '',
    additional_observations: ''
  };

  const parts = content.split(/\d\.\s+/);
  if (parts.length > 1) {
    sections.credibility_statements = parts[1]?.split('\n\n')[0]?.trim() || '';
    sections.case_studies = parts[2]?.split('\n\n')[0]?.trim() || '';
    sections.job_assessment = parts[3]?.split('\n\n')[0]?.trim() || '';
    sections.motivations = parts[4]?.split('\n\n')[0]?.trim() || '';
    sections.business_problems = parts[5]?.split('\n\n')[0]?.trim() || '';
    sections.additional_observations = parts[6]?.split('\n\n')[0]?.trim() || '';
  }

  console.log('[analyze-resume/database] Sections extracted:', {
    totalSections: Object.keys(sections).length,
    nonEmptySections: Object.values(sections).filter(v => v).length
  });
  return sections;
};

export const storeAnalysis = async (supabase: any, candidateId: string, sections: any) => {
  console.log('[analyze-resume/database] Starting analysis storage for candidate:', candidateId);
  
  try {
    // Removed the delete operation since Reset button handles this
    console.log('[analyze-resume/database] Inserting new analysis with sections:', {
      candidateId,
      sectionLengths: Object.entries(sections).map(([key, value]) => ({
        section: key,
        length: (value as string).length
      }))
    });

    const { data, error: insertError } = await supabase
      .from('resume_analyses')
      .insert({
        candidate_id: candidateId,
        ...sections
      })
      .select()
      .single();

    if (insertError) {
      console.error('[analyze-resume/database] Error storing analysis:', insertError);
      throw insertError;
    }

    console.log('[analyze-resume/database] Analysis stored successfully:', {
      analysisId: data?.id,
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('[analyze-resume/database] Error in database operations:', error);
    throw error;
  }
};