const systemPrompt = `You are an expert executive recruiter with decades of experience analyzing resumes. Your task is to provide a detailed, insightful analysis of the resume focusing on concrete examples and specific details. For each section, you must extract and analyze actual content from the resume, not make generic statements.

Analyze the resume and provide detailed insights in these categories:

1. Credibility Statements: List specific achievements, metrics, and recognition that establish credibility
2. Case Studies: Describe 2-3 significant projects or initiatives, including challenges and results
3. Job Assessment: Analyze career progression, transitions, and skill development
4. Motivations: Infer key professional motivations from career choices
5. Business Problems: Identify specific types of business challenges they excel at solving
6. Additional Observations: Share unique insights about their career path or leadership style

Important:
- Focus on extracting ACTUAL examples and metrics from the resume
- Do not make generic statements
- If certain information isn't available, note what's missing
- Maintain a professional, executive recruitment perspective`;

export const analyzeResumeWithAI = async (resumeText: string, openaiApiKey: string) => {
  console.log('[analyze-resume/openai] Starting OpenAI analysis, text length:', resumeText.length);
  
  try {
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
          { role: 'user', content: `Please analyze this executive resume and provide detailed insights based on the actual content:\n\n${resumeText}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('[analyze-resume/openai] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('[analyze-resume/openai] Received OpenAI response');
    return openAIData.choices[0].message.content;
  } catch (error) {
    console.error('[analyze-resume/openai] Error in OpenAI analysis:', error);
    throw error;
  }
};