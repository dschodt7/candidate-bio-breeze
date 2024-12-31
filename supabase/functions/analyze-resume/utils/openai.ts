import OpenAI from "https://esm.sh/openai@4.28.0";

export async function analyzeResumeWithAI(resumeText: string, apiKey: string) {
  console.log('[analyze-resume/openai] Starting resume analysis, text length:', resumeText.length);
  
  const openai = new OpenAI({ apiKey });

  try {
    console.log('[analyze-resume/openai] Sending request to OpenAI');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `Expert executive recruiter tasked to extract facts as well as deep insights from the resume in these sections. Ensure that all sections are responded to:

1. Results and Achievements
- Focus on quantifiable impacts and leadership outcomes
- Highlight specific metrics and business results
- Emphasize strategic initiatives and their outcomes

2. Case Studies
- Detail specific projects or initiatives that demonstrate leadership
- Include context, challenges, actions, and results
- Focus on strategic impact and complexity

3. Assessment of Current Skills and Experiences
- Evaluate current role and responsibilities
- Identify key leadership competencies
- Assess scope and scale of experience

4. Motivations
- Identify career progression patterns
- Analyze choices and transitions
- Determine key drivers and values

5. Business Problems They Solve Better Than Most
- Identify unique strengths and expertise
- Highlight recurring themes in achievements
- Note distinctive approaches to challenges

6. Additional Observations
- Note any unique patterns or characteristics
- Include relevant industry insights
- Mention any notable gaps or areas for development

Format each section with clear headers and detailed bullet points. Ensure all sections are completed with substantive analysis.`
        },
        {
          role: "user",
          content: `Please analyze this executive resume and provide detailed insights:\n\n${resumeText}`
        }
      ]
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('[analyze-resume/openai] Full OpenAI response:', {
      responseStatus: response.status,
      contentLength: content.length,
      contentPreview: content.substring(0, 500) + '...',
      sections: content.split(/\d\.\s+/).map(section => 
        section ? section.substring(0, 100) + `... (${section.length} chars)` : 'empty'
      )
    });

    return content;
  } catch (error) {
    console.error('[analyze-resume/openai] Error in OpenAI analysis:', error);
    throw error;
  }
}