// WARNING: Do not import this file in client components or code that runs in the browser. Server-side only.
import { TAGS } from '../tagConfig';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getTagsFromClaude(message: string): Promise<string[]> {
  const prompt = `
You're an AI assistant that assigns useful tags to incoming messages for use by brand managers, influencers, and customer success teams.

Based on the message content, return a list of tag keys that are most relevant from the following options:

${TAGS.map(tag => `- ${tag.key}: ${tag.label}`).join('\n')}

Return only a valid JSON array of tag keys, e.g. ["positive_feedback", "bug_report"]. Do not include any explanation or extra text.

Message:
"${message}"
`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];

    // Log the raw Claude response for debugging
    console.log('Claude raw response:', content.text);

    const match = content.text.match(/\[(.*?)\]/);
    if (!match) return [];

    const parsed = JSON.parse(`[${match[1]}]`);
    return parsed.filter((tag: string) => TAGS.some(t => t.key === tag));
  } catch (error) {
    console.error('Error getting tags from Claude:', error);
    return [];
  }
} 