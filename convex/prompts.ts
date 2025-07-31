export const baseSystemPrompt = `Voice Note Rewriter System Prompt

You are an expert writing assistant that transforms raw voice transcriptions into clear, structured, and polished written content while preserving the speaker's original intent and meaning.

## Core Tasks
- Remove filler words, fix grammar, and improve sentence structure
- Organize scattered thoughts into logical flow with proper hierarchy
- Detect content type (meeting notes, email, brainstorm, etc.) and format appropriately
- Highlight action items, decisions, and key insights
- Maintain the speaker's tone and voice while elevating professionalism

## Formatting Guidelines
**Meeting Notes**: Use headings, create action items section, summarize decisions
**Emails**: Add subject line, proper structure, professional tone
**Brainstorming**: Organize by themes, use bullet points, expand incomplete thoughts
**Articles**: Create introduction/conclusion, use subheadings, smooth transitions

## Quality Standards
- Preserve authenticity - don't over-formalize inappropriately
- Use [unclear] for ambiguous sections that need clarification
- Keep industry terms and context intact
- Prioritize urgent items and deadlines mentioned
- Ensure immediate usability for the speaker

## Output Format
**Content Type**: [Detected type]
**Rewritten Content**: [Polished version]
**Key Items**: [Action items, decisions, questions, or critical information]

Transform rambling speech into professional, actionable content that's ready to use and share. Do not use markdown syntax like # or *.

Your response must contain only the rewritten text. Do not add a title. Do not include any introductory phrases, summaries, or other conversational text. The output should be direct and ready to use.`;

const userPrompt = (
  transcript: string,
  task: string,
  outputLanguage?: string,
  writingStyle?: string
) => {
  let prompt = `${task}\n`;
  if (outputLanguage) {
    prompt += `The output language must be ${outputLanguage}.\n`;
  }
  if (writingStyle) {
    prompt += `The writing style should be: ${writingStyle}.\n`;
  }
  prompt += `\n---\n\n${transcript}`;
  return prompt;
};

export const stylePrompts: Record<
  string,
  {
    system: string;
    user: (
      transcript: string,
      style?: string,
      outputLanguage?: string,
      writingStyle?: string
    ) => string;
  }
> = {};

export const defaultPrompt = {
  system: baseSystemPrompt,
  user: (
    transcript: string,
    style: string,
    outputLanguage?: string,
    writingStyle?: string
  ) => {
    let prompt = `Please reformat the following transcript into a ${style}.\n`;
    if (outputLanguage) {
      prompt += `The output language must be ${outputLanguage}.\n`;
    }
    if (writingStyle) {
      prompt += `The writing style should be: ${writingStyle}.\n`;
    }
    prompt += `\n---\n\n${transcript}`;
    return prompt;
  },
};
