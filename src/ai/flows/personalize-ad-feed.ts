'use server';

/**
 * @fileOverview An AI agent that personalizes the ad feed for a user based on their past interactions.
 *
 * - personalizeAdFeed - A function that personalizes the ad feed for a user.
 * - PersonalizeAdFeedInput - The input type for the personalizeAdFeed function.
 * - PersonalizeAdFeedOutput - The return type for the personalizeAdFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
  name: 'personalizeAdFeedPrompt',
  input: {schema: PersonalizeAdFeedInputSchema},
  output: {schema: PersonalizeAdFeedOutputSchema},
  prompt: `You are an expert advertising personalization agent.

You will receive the user's past interactions with ads, including likes, dislikes, ratings, and followed categories. You will also receive a list of available ads and their categories.

Based on this information, you will personalize the ad feed for the user, showing them ads that are more relevant to their interests.

User Past Interactions: {{{userPastInteractions}}}
Available Ads: {{{availableAds}}}

Personalized Ad Feed:`,
});

const personalizeAdFeedFlow = ai.defineFlow(
  {
    name: 'personalizeAdFeedFlow',
    inputSchema: PersonalizeAdFeedInputSchema,
    outputSchema: PersonalizeAdFeedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
