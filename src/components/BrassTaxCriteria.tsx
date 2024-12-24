import { CriteriaSection } from "@/components/criteria/CriteriaSection";
import { useCriteriaSection } from "@/hooks/useCriteriaSection";

const initialSections = {
  compensation: {
    title: "Compensation Expectations",
    helpText: "Discuss desired salary range, including base, bonuses, and equity. Benchmark against industry standards and location.",
    value: "",
  },
  workPreference: {
    title: "Hybrid/Remote or Travel Preferences",
    helpText: "Clarify whether the candidate prefers remote, hybrid, or on-site roles. Identify flexibility for occasional or frequent travel.",
    value: "",
  },
  credibility: {
    title: "Credibility Statements",
    helpText: "Highlight achievements and qualifications that validate the candidate's expertise. Use data-driven examples or significant milestones.",
    value: "",
  },
  caseStudies: {
    title: "Case Studies",
    helpText: "Include examples of specific problems solved or impactful projects delivered. Showcase transferable skills and industry relevance.",
    value: "",
  },
  jobAssessment: {
    title: "Complete Assessment of Job",
    helpText: "Review role responsibilities, team dynamics, and company goals. Ensure alignment with the candidate's career trajectory.",
    value: "",
  },
  motivations: {
    title: "Clear Assessment of Motivations",
    helpText: "Explore why the candidate is pursuing this role or industry. Identify values and drivers for long-term satisfaction.",
    value: "",
  },
  timeframe: {
    title: "Timeframe and Availability",
    helpText: "Confirm readiness to transition into the role. Discuss availability for interviews and onboarding timelines.",
    value: "",
  },
};

export const BrassTaxCriteria = () => {
  const { sections, savedSections, handleSubmit, handleReset, handleChange } = 
    useCriteriaSection(initialSections);

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([key, section]) => (
        <CriteriaSection
          key={key}
          title={section.title}
          helpText={section.helpText}
          value={section.value}
          isSubmitted={savedSections[key]}
          onChange={(value) => handleChange(key, value)}
          onSubmit={() => handleSubmit(key)}
          onReset={() => handleReset(key)}
        />
      ))}
    </div>
  );
};