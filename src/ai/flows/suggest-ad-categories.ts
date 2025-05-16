
'use server';

/**
 * @fileOverview AI agent that suggests ad categories for new users, using DeepSeek API via OpenAI SDK.
 *
 * - suggestAdCategories - A function that suggests ad categories based on user profile data.
 * - SuggestAdCategoriesInput - The input type for the suggestAdCategories function.
 * - SuggestAdCategoriesOutput - The return type for the suggestAdCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from 'openai';

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

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'; // Standard v1 endpoint for OpenAI compatibility
const DEEPSEEK_MODEL = 'deepseek-chat'; // Or your preferred DeepSeek model

const suggestAdCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestAdCategoriesFlow',
    inputSchema: SuggestAdCategoriesInputSchema,
    outputSchema: SuggestAdCategoriesOutputSchema,
  },
  async (input: SuggestAdCategoriesInput) => {
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
      console.error('DeepSeek API key is not configured. Please set DEEPSEEK_API_KEY in your .env file.');
      return { suggestedCategories: ['Configuration needed: DeepSeek API Key'] };
    }

    const openai = new OpenAI({
        baseURL: DEEPSEEK_BASE_URL,
        apiKey: DEEPSEEK_API_KEY,
    });

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
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: promptText }],
        model: DEEPSEEK_MODEL,
        // Some APIs (like OpenAI's) support a response_format option to enforce JSON output.
        // Check DeepSeek documentation if such an option exists and how to use it with their OpenAI-compatible endpoint.
        // e.g., response_format: { type: "json_object" } // This is hypothetical for DeepSeek
      });

      const messageContent = completion.choices[0]?.message?.content;

      if (!messageContent) {
        console.warn('Unexpected DeepSeek API response structure or empty content:', JSON.stringify(completion, null, 2));
        throw new Error('Unexpected response structure or empty content from DeepSeek API.');
      }
      
      // The content might be a stringified JSON, so parse it.
      let parsedOutput;
      try {
        // Attempt to clean the content if it's wrapped in ```json ... ```
        let cleanJsonString = messageContent.trim();
        if (cleanJsonString.startsWith("```json")) {
            cleanJsonString = cleanJsonString.substring(7); // Remove ```json
            if (cleanJsonString.endsWith("```")) {
                cleanJsonString = cleanJsonString.substring(0, cleanJsonString.length - 3); // Remove ```
            }
        }
        parsedOutput = JSON.parse(cleanJsonString);
      } catch (e) {
        console.error('Failed to parse JSON from DeepSeek response content:', messageContent, e);
        throw new Error('DeepSeek response content was not valid JSON.');
      }

      // Validate the parsed output against our Zod schema
      const validatedOutput = SuggestAdCategoriesOutputSchema.safeParse(parsedOutput);
      if (!validatedOutput.success) {
        console.error('DeepSeek output validation failed:', validatedOutput.error.flatten());
        // Log the problematic parsed output for better debugging
        console.error('Problematic parsed output from DeepSeek:', JSON.stringify(parsedOutput, null, 2));
        throw new Error('DeepSeek output did not match the expected schema.');
      }

      return validatedOutput.data;

    } catch (error) {
      console.error('Error calling DeepSeek API via OpenAI SDK or processing response:', error);
      // For more detailed error, check if it's an APIError from OpenAI SDK
      if (error instanceof OpenAI.APIError) {
        console.error('DeepSeek API Error Status:', error.status);
        console.error('DeepSeek API Error Message:', error.message);
        console.error('DeepSeek API Error Code:', error.code);
        console.error('DeepSeek API Error Type:', error.type);
      }
      return { suggestedCategories: ['Error processing request'] };
    }
  }
);
