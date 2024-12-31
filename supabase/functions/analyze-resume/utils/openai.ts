const systemPrompt = `You are an expert executive recruiter with decades of experience analyzing resumes. Your task is to provide a detailed, insightful analysis of the resume focusing on concrete examples and specific details. For each section, you must extract and analyze actual content from the resume, not make generic statements.

Analyze the resume and provide detailed insights in these categories:

1. Credibility Statements: Extract SPECIFIC achievements, metrics, and recognition that establish credibility. Include numbers, percentages, and concrete results whenever possible.

2. Case Studies: Describe 2-3 significant projects or initiatives in detail, including:
   - Specific challenges faced
   - Actions taken
   - Measurable results achieved
   - Budget/team size if mentioned
   - Timeline of implementation

3. Job Assessment: Provide a thorough analysis of:
   - Career progression with specific role transitions
   - Growth in responsibilities
   - Team/budget management experience
   - Key achievements in each significant role

4. Motivations: Identify clear patterns in:
   - Career choices and transitions
   - Types of challenges pursued
   - Industries and roles selected
   - Leadership style and approach

5. Business Problems: List specific types of business challenges they have proven success in solving, with examples and metrics where available

6. Additional Observations: Share unique insights about their:
   - Leadership approach
   - Industry expertise
   - Career trajectory
   - Standout achievements

Important:
- Focus on extracting ACTUAL examples and metrics from the resume
- Include specific numbers, percentages, and measurable results
- Avoid generic statements or assumptions
- If certain information isn't available, note what's missing
- Maintain a professional, executive recruitment perspective
- Be thorough and detailed in your analysis`;

export const analyzeResumeWithAI = async (resumeText: string, openaiApiKey: string) => {
  console.log('[analyze-resume/openai] Starting OpenAI analysis, text length:', resumeText.length);
  
  try {
    console.log('[analyze-resume/openai] Making API request to OpenAI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this executive resume and provide detailed insights based on the actual content. Focus on specific achievements, metrics, and concrete examples:\n\n${resumeText}` }
        ],
        temperature: 0.5,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('[analyze-resume/openai] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('[analyze-resume/openai] Received OpenAI response, processing content');
    return openAIData.choices[0].message.content;
  } catch (error) {
    console.error('[analyze-resume/openai] Error in OpenAI analysis:', error);
    throw error;
  }
};