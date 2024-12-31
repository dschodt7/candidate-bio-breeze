import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.28.0";

export async function analyzeResumeWithAI(resumeText: string, apiKey: string) {
  console.log('[analyze-resume/openai] Starting resume analysis, text length:', resumeText.length);
  
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are an expert executive resume analyst. Analyze the resume and provide detailed insights in the following categories: 1. Results and Achievements (focus on quantifiable impacts and leadership outcomes) 2. Case Studies (highlight specific projects or initiatives that demonstrate leadership) 3. Assessment of Current Skills and Experiences 4. Motivations (what drives this leader) 5. Business Problems They Solve Better Than Most 6. Additional Observations. Format with clear headers and bullet points."
        },
        {
          role: "user",
          content: `Please analyze this executive resume and provide detailed insights:\n\n${resumeText}`
        }
      ]
    });

    const content = response.data.choices[0].message?.content;
    console.log('[analyze-resume/openai] Full OpenAI response:', {
      responseStatus: response.status,
      contentLength: content?.length,
      contentPreview: content?.substring(0, 500) + '...',
      allSections: content?.split(/\d\.\s+/).map(section => section.substring(0, 100) + '...')
    });

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('[analyze-resume/openai] Error in OpenAI analysis:', error);
    throw error;
  }
}