
'use server';

/**
 * @fileOverview AI agent that suggests ad categories for new users, using DeepSeek API via OpenAI SDK.
 *
 * - suggestAdCategories - A function that suggests ad categories based on user profile data.
 * - SuggestAdCategoriesInput - The input type for the suggestAdCategories function.
 * - SuggestAdCategoriesOutput - The return type for the suggestAdCategories function.
 */

import {z} from 'zod';
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


const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
// IMPORTANT: Replace 'deepseek-chat-v3' or the default with your specific DeepSeek model name if different.
const DEEPSEEK_MODEL = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || 'deepseek-chat'; 

export async function suggestAdCategories(
  input: SuggestAdCategoriesInput
): Promise<SuggestAdCategoriesOutput> {
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
    console.error('DeepSeek API key is not configured. Please set DEEPSEEK_API_KEY in your .env file.');
    return { suggestedCategories: ['Configuration needed: DeepSeek API Key'] };
  }
  if (!process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL) {
    console.warn('DeepSeek Base URL is not configured in .env. Using default. Please set NEXT_PUBLIC_DEEPSEEK_BASE_URL.');
  }
  if (!process.env.NEXT_PUBLIC_DEEPSEEK_MODEL) {
    console.warn('DeepSeek Model is not configured in .env. Using default. Please set NEXT_PUBLIC_DEEPSEEK_MODEL.');
  }

  const openai = new OpenAI({
      baseURL: DEEPSEEK_BASE_URL,
      apiKey: DEEPSEEK_API_KEY,
  });

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
    });

    const messageContent = completion.choices[0]?.message?.content;

    if (!messageContent) {
      console.warn('Unexpected DeepSeek API response structure or empty content:', JSON.stringify(completion, null, 2));
      throw new Error('Unexpected response structure or empty content from DeepSeek API.');
    }
    
    let cleanJsonString = messageContent.trim();
    if (cleanJsonString.startsWith("```json")) {
        cleanJsonString = cleanJsonString.substring(7); 
        if (cleanJsonString.endsWith("```")) {
            cleanJsonString = cleanJsonString.substring(0, cleanJsonString.length - 3); 
        }
    }
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error('Failed to parse JSON from DeepSeek response content:', cleanJsonString, e);
      throw new Error('DeepSeek response content was not valid JSON.');
    }

    const validatedOutput = SuggestAdCategoriesOutputSchema.safeParse(parsedOutput);
    if (!validatedOutput.success) {
      console.error('DeepSeek output validation failed:', validatedOutput.error.flatten());
      console.error('Problematic parsed output from DeepSeek:', JSON.stringify(parsedOutput, null, 2));
      throw new Error('DeepSeek output did not match the expected schema.');
    }

    return validatedOutput.data;

  } catch (error) {
    console.error('Error calling DeepSeek API via OpenAI SDK or processing response:', error);
    if (error instanceof OpenAI.APIError) {
      console.error('DeepSeek API Error Status:', error.status);
      console.error('DeepSeek API Error Message:', error.message);
      console.error('DeepSeek API Error Code:', error.code);
      console.error('DeepSeek API Error Type:', error.type);
    }
    return { suggestedCategories: ['Error processing request'] };
  }
}
