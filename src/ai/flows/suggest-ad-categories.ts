'use server';

/**
 * @fileOverview AI agent that suggests ad categories for new users.
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

const prompt = ai.definePrompt({
  name: 'suggestAdCategoriesPrompt',
  input: {schema: SuggestAdCategoriesInputSchema},
  output: {schema: SuggestAdCategoriesOutputSchema},
  prompt: `You are an expert in understanding user interests and matching them to relevant ad categories.

  Given the following user profile, suggest a list of ad categories that the user might be interested in.  The categories should be comma seperated.

  User Profile: {{{userProfile}}}

  Suggest ad categories:`,
});

const suggestAdCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestAdCategoriesFlow',
    inputSchema: SuggestAdCategoriesInputSchema,
    outputSchema: SuggestAdCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
