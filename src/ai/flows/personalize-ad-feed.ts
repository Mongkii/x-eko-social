
'use server';

/**
 * @fileOverview An AI agent that personalizes the ad feed for a user based on their past interactions, using DeepSeek API via OpenAI SDK.
 *
 * - personalizeAdFeed - A function that personalizes the ad feed for a user.
 * - PersonalizeAdFeedInput - The input type for the personalizeAdFeed function.
 * - PersonalizeAdFeedOutput - The return type for the personalizeAdFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from 'openai';

const PersonalizeAdFeedInputSchema = z.object({
  userPastInteractions: z
    .string()
    .describe(
      'A string containing the user past interactions with ads, including likes, dislikes, ratings, and followed categories.'
    ),
  availableAds: z
    .string()
    .describe('A string containing the list of available ads and their categories.'),
});
export type PersonalizeAdFeedInput = z.infer<typeof PersonalizeAdFeedInputSchema>;

const PersonalizeAdFeedOutputSchema = z.object({
  personalizedAdFeed: z
    .string()
    .describe('A string containing the list of ads personalized for the user.'),
});
export type PersonalizeAdFeedOutput = z.infer<typeof PersonalizeAdFeedOutputSchema>;

export async function personalizeAdFeed(input: PersonalizeAdFeedInput): Promise<PersonalizeAdFeedOutput> {
  return personalizeAdFeedFlow(input);
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'; // Standard v1 endpoint for OpenAI compatibility
const DEEPSEEK_MODEL = 'deepseek-chat-v3'; // Placeholder - verify correct V3 model name

const personalizeAdFeedFlow = ai.defineFlow(
  {
    name: 'personalizeAdFeedFlow',
    inputSchema: PersonalizeAdFeedInputSchema,
    outputSchema: PersonalizeAdFeedOutputSchema,
  },
  async (input: PersonalizeAdFeedInput) => {
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
      console.error('DeepSeek API key is not configured. Please set DEEPSEEK_API_KEY in your .env file.');
      return { personalizedAdFeed: 'Configuration needed: DeepSeek API Key. Could not personalize feed.' };
    }

    const openai = new OpenAI({
        baseURL: DEEPSEEK_BASE_URL,
        apiKey: DEEPSEEK_API_KEY,
    });

    const promptText = `You are an expert advertising personalization agent.
You will receive the user's past interactions with ads, including likes, dislikes, ratings, and followed categories. You will also receive a list of available ads and their categories.
Based on this information, you will personalize the ad feed for the user, showing them ads that are more relevant to their interests.
Your response MUST be a valid JSON object with a single key "personalizedAdFeed", where the value is a string listing the personalized ads.
For example:
{
  "personalizedAdFeed": "TechGiant Smartphone Pro, FashionBrandX Summer Collection"
}

User Past Interactions:
${input.userPastInteractions}

Available Ads:
${input.availableAds}
`;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: promptText }],
        model: DEEPSEEK_MODEL,
        // Consider adding response_format: { type: "json_object" } if DeepSeek supports it
      });

      const messageContent = completion.choices[0]?.message?.content;

      if (!messageContent) {
        console.warn('Unexpected DeepSeek API response structure or empty content for personalizeAdFeed:', JSON.stringify(completion, null, 2));
        throw new Error('Unexpected response structure or empty content from DeepSeek API.');
      }
      
      let cleanJsonString = messageContent.trim();
      if (cleanJsonString.startsWith("```json")) {
          cleanJsonString = cleanJsonString.substring(7); // Remove ```json
          if (cleanJsonString.endsWith("```")) {
              cleanJsonString = cleanJsonString.substring(0, cleanJsonString.length - 3); // Remove ```
          }
      }
      
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(cleanJsonString);
      } catch (e) {
        console.error('Failed to parse JSON from DeepSeek response content for personalizeAdFeed:', cleanJsonString, e);
        throw new Error('DeepSeek response content was not valid JSON.');
      }

      const validatedOutput = PersonalizeAdFeedOutputSchema.safeParse(parsedOutput);
      if (!validatedOutput.success) {
        console.error('DeepSeek output validation failed for personalizeAdFeed:', validatedOutput.error.flatten());
        console.error('Problematic parsed output from DeepSeek for personalizeAdFeed:', JSON.stringify(parsedOutput, null, 2));
        throw new Error('DeepSeek output did not match the expected schema.');
      }

      return validatedOutput.data;

    } catch (error) {
      console.error('Error calling DeepSeek API via OpenAI SDK for personalizeAdFeed or processing response:', error);
      if (error instanceof OpenAI.APIError) {
        console.error('DeepSeek API Error Status:', error.status);
        console.error('DeepSeek API Error Message:', error.message);
        console.error('DeepSeek API Error Code:', error.code);
        console.error('DeepSeek API Error Type:', error.type);
      }
      return { personalizedAdFeed: 'Error processing personalization request with DeepSeek.' };
    }
  }
);
