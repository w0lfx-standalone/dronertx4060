'use server';

/**
 * @fileOverview A flow to explain why a drone was detected.
 *
 * - explainDroneDetection - A function that explains why a drone was detected.
 * - ExplainDroneDetectionInput - The input type for the explainDroneDetection function.
 * - ExplainDroneDetectionOutput - The return type for the explainDroneDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDroneDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the detected object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  objectSize: z.string().describe('The size of the detected object.'),
  motionPatterns: z.string().describe('The observed motion patterns of the object.'),
});
export type ExplainDroneDetectionInput = z.infer<typeof ExplainDroneDetectionInputSchema>;

const ExplainDroneDetectionOutputSchema = z.object({
  explanation: z.string().describe('The explanation of why the object was identified as a drone.'),
});
export type ExplainDroneDetectionOutput = z.infer<typeof ExplainDroneDetectionOutputSchema>;

export async function explainDroneDetection(input: ExplainDroneDetectionInput): Promise<ExplainDroneDetectionOutput> {
  return explainDroneDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainDroneDetectionPrompt',
  input: {schema: ExplainDroneDetectionInputSchema},
  output: {schema: ExplainDroneDetectionOutputSchema},
  prompt: `You are an expert system designed to explain why an object was identified as a drone.

You will use the following information to provide a clear and concise explanation:

Object Size: {{{objectSize}}}
Motion Patterns: {{{motionPatterns}}}
Photo: {{media url=photoDataUri}}

Based on this information, explain why the object was likely identified as a drone. Consider factors such as the object's size, movement patterns, and appearance in the photo. Provide a reasoned explanation that helps the user understand the system's decision-making process.`,
});

const explainDroneDetectionFlow = ai.defineFlow(
  {
    name: 'explainDroneDetectionFlow',
    inputSchema: ExplainDroneDetectionInputSchema,
    outputSchema: ExplainDroneDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
