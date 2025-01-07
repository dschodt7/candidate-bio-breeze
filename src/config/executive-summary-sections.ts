import { ExecutiveSummarySectionConfig } from "@/types/executive-summary-section";

export const CREDIBILITY_SECTION: ExecutiveSummarySectionConfig = {
  key: "credibility",
  title: "Assessment of Current Skills and Experiences",
  helpText: "Highlight achievements and qualifications that validate the candidate's expertise. Use data-driven examples or significant milestones.",
  requiresAICompile: true,
  showSourceAnalysis: true,
};

export const RESULTS_SECTION: ExecutiveSummarySectionConfig = {
  key: "results",
  title: "Results and Achievements",
  helpText: "Highlight quantifiable business impact, strategic outcomes, and validated achievements. Focus on metrics, scale, and specific results.",
  requiresAICompile: true,
  showSourceAnalysis: true,
};