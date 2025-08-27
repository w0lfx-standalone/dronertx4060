'use server';

/**
 * @fileOverview A flow to explain why a drone was detected.
 *
 * - explainDroneDetection - A function that explains why a drone was detected.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ExplainDroneDetectionInputSchema, ExplainDroneDetectionOutputSchema, type ExplainDroneDetectionInput, type ExplainDroneDetectionOutput } from '@/types';


export async function explainDroneDetection(input: ExplainDroneDetectionInput): Promise<ExplainDroneDetectionOutput> {
  return explainDroneDetectionFlow(input);
}

const explainDroneDetectionFlow = ai.defineFlow(
  {
    name: 'explainDroneDetectionFlow',
    inputSchema: ExplainDroneDetectionInputSchema,
    outputSchema: ExplainDroneDetectionOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      model: 'ollama/llama3',
      prompt: `You are an expert system designed to explain why an object was identified as a drone.

      You will use the following information to provide a clear and concise explanation:

      Object Size: ${input.objectSize}
      Motion Patterns: ${input.motionPatterns}
      Photo: {{media url=${input.photoDataUri}}}

      Based on this information, explain why the object was likely identified as a drone. Consider factors such as the object's size, movement patterns, and appearance in the photo.`,
    });

    return {
      explanation: llmResponse.text,
    };
  }
);
