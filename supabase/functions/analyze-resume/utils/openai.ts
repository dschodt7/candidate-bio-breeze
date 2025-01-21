import OpenAI from "https://esm.sh/openai@4.28.0";

export async function analyzeResumeWithAI(resumeText: string, apiKey: string) {
  console.log('[analyze-resume/openai] Starting resume analysis, text length:', resumeText.length);
  
  const openai = new OpenAI({ apiKey });

  try {
    console.log('[analyze-resume/openai] Preparing OpenAI request');
    const messages = [
      {
        role: "system",
        content: `You are an expert executive recruiter with 20+ years of experience analyzing C-suite careers. Your analysis will be conducted in two phases and organized into six specific sections.

PHASE 1 - FACT EXTRACTION:
First, methodically extract concrete FACTS from the resume, organizing them by:
- Quantifiable achievements (revenue, growth, team size, budget)
- Career progression timeline and roles
- Scope of responsibilities at each level
- Industry experience and market exposure
- Technical and leadership competencies
- Educational background and certifications

PHASE 2 - STRATEGIC ANALYSIS:
Using these facts as evidence, provide deep insights for each required section:

1. Results and Achievements
- Transform raw metrics into compelling evidence of leadership impact
- Connect achievements to strategic business outcomes
- Highlight patterns of increasing scope and complexity

2. Case Studies
- Select the most strategic initiatives that showcase leadership capability
- Analyze the complexity of challenges and sophistication of solutions
- Draw insights about decision-making approach and execution style

3. Assessment of Current Skills and Experiences
- Identify unique combinations of skills that differentiate this leader
- Evaluate depth vs breadth in key leadership areas
- Map capabilities to current market demands

4. Motivations
- Analyze career choices to reveal core drivers
- Identify patterns in role transitions and growth
- Uncover evidence of leadership philosophy

5. Business Problems They Solve Better Than Most
- Pinpoint distinctive approaches to challenges
- Identify recurring themes in problem-solving
- Connect varied experiences to show unique perspective

6. Additional Observations
- Highlight unexpected patterns or combinations
- Note market-relevant insights
- Identify potential growth areas

Format each section with bullet points. Make insights bold and specific, always tied to extracted facts. Do not use the candidate's name. Focus on insights that would be valuable to hiring executives.`
      },
      {
        role: "user",
        content: `Please analyze this executive resume and provide detailed insights:\n\n${resumeText}`
      }
    ];

    console.log('[analyze-resume/openai] Sending request to OpenAI API');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.8,
      messages
    });

    console.log('[analyze-resume/openai] OpenAI API response status:', {
      id: response.id,
      model: response.model,
      choicesLength: response.choices?.length,
      hasChoices: !!response.choices,
      firstChoice: response.choices?.[0] ? {
        finishReason: response.choices[0].finish_reason,
        hasMessage: !!response.choices[0].message,
        messageRole: response.choices[0].message?.role,
        contentLength: response.choices[0].message?.content?.length
      } : 'No first choice'
    });

    if (!response.choices?.[0]?.message?.content) {
      console.error('[analyze-resume/openai] Invalid response structure:', response);
      throw new Error('Invalid response structure from OpenAI API');
    }

    const content = response.choices[0].message.content;
    console.log('[analyze-resume/openai] Successfully received content, length:', content.length);
    
    return content;
  } catch (error) {
    console.error('[analyze-resume/openai] Error in OpenAI analysis:', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response data'
    });
    throw error;
  }
}