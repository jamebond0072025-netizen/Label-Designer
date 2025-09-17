'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered suggestions to improve label designs.
 *
 * @fileOverview
 * - `suggestDesignImprovements` -  A function that takes label design data and provides improvement suggestions.
 * - `SuggestDesignImprovementsInput` - The input type for the suggestDesignImprovements function.
 * - `SuggestDesignImprovementsOutput` - The output type for the suggestDesignImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDesignImprovementsInputSchema = z.object({
  designData: z
    .string()
    .describe('JSON object containing the design data of the label.'),
  labelData: z
    .string()
    .describe('JSON object containing the data to be used in the label.'),
});
export type SuggestDesignImprovementsInput = z.infer<
  typeof SuggestDesignImprovementsInputSchema
>;

const SuggestDesignImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of suggestions on how to improve the label design, in plain english.'
    ),
});
export type SuggestDesignImprovementsOutput = z.infer<
  typeof SuggestDesignImprovementsOutputSchema
>;

export async function suggestDesignImprovements(
  input: SuggestDesignImprovementsInput
): Promise<SuggestDesignImprovementsOutput> {
  return suggestDesignImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDesignImprovementsPrompt',
  input: {schema: SuggestDesignImprovementsInputSchema},
  output: {schema: SuggestDesignImprovementsOutputSchema},
  prompt: `You are an AI expert in label design. Analyze the provided label design and data, and provide suggestions on how to improve the design.

Label Design Data: {{{designData}}}
Label Data: {{{labelData}}}

Suggestions:`, // No need for Handlebars logic, just instructions.
});

const suggestDesignImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestDesignImprovementsFlow',
    inputSchema: SuggestDesignImprovementsInputSchema,
    outputSchema: SuggestDesignImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
