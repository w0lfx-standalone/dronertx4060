'use server';

/**
 * @fileOverview A flow to explain why a drone was detected.
 *
 * - explainDroneDetection - A function that explains why a drone was detected.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
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
      prompt: `Analyze the provided data to explain why the object was identified as a drone.
      Your analysis should be based on the following:
      - Object Size: ${input.objectSize}
      - Motion Patterns: ${input.motionPatterns}
      - Photo: {{media url=${input.photoDataUri}}}
      
      Provide a concise explanation for the drone identification.`,
    });

    return {
      explanation: llmResponse.text,
    };
  }
);
