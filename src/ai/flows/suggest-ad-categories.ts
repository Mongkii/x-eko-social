
'use server';

/**
 * @fileOverview AI agent that suggests ad categories for new users, using DeepSeek API.
 *
 * - suggestAdCategories - A function that suggests ad categories based on user profile data.
 * - SuggestAdCategoriesInput - The input type for the suggestAdCategories function.
 * - SuggestAdCategoriesOutput - The return type for the suggestAdCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAdCategoriesInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'A description of the user profile, including interests, demographics, and any other relevant information.'
    ),
});
export type SuggestAdCategoriesInput = z.infer<typeof SuggestAdCategoriesInputSchema>;

const SuggestAdCategoriesOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('An array of suggested ad categories based on the user profile.'),
});
export type SuggestAdCategoriesOutput = z.infer<typeof SuggestAdCategoriesOutputSchema>;

export async function suggestAdCategories(
  input: SuggestAdCategoriesInput
): Promise<SuggestAdCategoriesOutput> {
  return suggestAdCategoriesFlow(input);
}

// Placeholder for DeepSeek API details - User needs to configure these
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = 'deepseek-chat'; // Or your preferred DeepSeek model
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'; // Replace with actual endpoint if different

const suggestAdCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestAdCategoriesFlow',
    inputSchema: SuggestAdCategoriesInputSchema,
    outputSchema: SuggestAdCategoriesOutputSchema,
  },
  async (input: SuggestAdCategoriesInput) => {
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
      console.error('DeepSeek API key is not configured. Please set DEEPSEEK_API_KEY in your .env file.');
      // Fallback or error handling:
      // Option 1: Throw an error
      // throw new Error('DeepSeek API key not configured.');
      // Option 2: Return a default/empty response (example)
      return { suggestedCategories: ['Configuration needed: DeepSeek API Key'] };
    }

    // Construct the prompt for DeepSeek
    // This prompt instructs the model to return JSON in the desired format.
    const promptText = `You are an expert in understanding user interests and matching them to relevant ad categories.
Given the following user profile:
"${input.userProfile}"

Suggest a list of ad categories that the user might be interested in.
Your response MUST be a valid JSON object with a single key "suggestedCategories", where the value is an array of strings representing the categories.
For example:
{
  "suggestedCategories": ["Technology", "Travel", "Food & Cooking"]
}
`;

    try {
      const response = await fetch(DEEPSEEK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [{ role: 'user', content: promptText }],
          // Some APIs support a response_format option to enforce JSON output.
          // Check DeepSeek documentation if such an option exists, e.g.:
          // response_format: { type: "json_object" } // This is hypothetical
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`DeepSeek API request failed with status ${response.status}: ${errorBody}`);
        throw new Error(`DeepSeek API request failed: ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();

      // Assuming the DeepSeek API returns a structure like OpenAI's,
      // where the main content is in result.choices[0].message.content.
      // Adjust this based on the actual DeepSeek API response structure.
      let messageContent = '';
      if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
        messageContent = result.choices[0].message.content;
      } else {
        // Log the unexpected structure for debugging
        console.warn('Unexpected DeepSeek API response structure:', JSON.stringify(result, null, 2));
        throw new Error('Unexpected response structure from DeepSeek API.');
      }
      
      // The content might be a stringified JSON, so parse it.
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(messageContent);
      } catch (e) {
        console.error('Failed to parse JSON from DeepSeek response content:', messageContent, e);
        throw new Error('DeepSeek response content was not valid JSON.');
      }

      // Validate the parsed output against our Zod schema
      const validatedOutput = SuggestAdCategoriesOutputSchema.safeParse(parsedOutput);
      if (!validatedOutput.success) {
        console.error('DeepSeek output validation failed:', validatedOutput.error.flatten());
        throw new Error('DeepSeek output did not match the expected schema.');
      }

      return validatedOutput.data;

    } catch (error) {
      console.error('Error calling DeepSeek API or processing response:', error);
      // You might want to re-throw the error or return a fallback
      // For example, re-throwing:
      // throw error;
      // Or returning a fallback:
      return { suggestedCategories: ['Error processing request'] };
    }
  }
);
