'use server';
/**
 * @fileOverview This file defines a Genkit flow for real-time drone detection using webcam feed analysis.
 *
 * - realTimeDroneDetection - A function that processes webcam feed to detect drones and provide alerts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { RealTimeDroneDetectionInputSchema, RealTimeDroneDetectionOutputSchema, type RealTimeDroneDetectionInput, type RealTimeDroneDetectionOutput } from '@/types';

export async function realTimeDroneDetection(input: RealTimeDroneDetectionInput): Promise<RealTimeDroneDetectionOutput> {
  return realTimeDroneDetectionFlow(input);
}

const detectionPrompt = ai.definePrompt({
    name: 'droneDetectionPrompt',
    model: 'ollama/llama3',
    input: { schema: RealTimeDroneDetectionInputSchema },
    output: { schema: RealTimeDroneDetectionOutputSchema },
    prompt: `Analyze the image to determine if a drone is present. A drone is a flying machine, often with multiple rotors or propellers and a central body. It can be a real one, a toy, or a picture of one.
- If a drone is detected, set objectType to "drone" and droneDetected to true.
- If you see a bird, set objectType to "bird" and droneDetected to false.
- If you see a plane, set objectType to "plane" and droneDetected to false.
- If you see a person's face or body, set objectType to "person" and droneDetected to false.
- If nothing of interest is detected, set objectType to "none" and droneDetected to false.
Provide a brief explanation for your detection.
Image: {{media url=frameDataUri}}`,
});


const realTimeDroneDetectionFlow = ai.defineFlow(
  {
    name: 'realTimeDroneDetectionFlow',
    inputSchema: RealTimeDroneDetectionInputSchema,
    outputSchema: RealTimeDroneDetectionOutputSchema,
  },
  async (input) => {
    try {
      const llmResponse = await detectionPrompt(input);
      const output = llmResponse.output;

      if (!output) {
        return {
          droneDetected: false,
          objectType: 'none',
          explanation: 'No valid response from model.',
          debug: 'Model returned no output.'
        };
      }
      
      return {
        droneDetected: output.objectType === 'drone',
        objectType: output.objectType,
        explanation: output.explanation,
        debug: `Model response: ${JSON.stringify(output)}`
      };

    } catch (error) {
      console.error('Error processing drone detection flow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        droneDetected: false,
        objectType: 'error',
        explanation: 'Error processing frame.',
        debug: `Flow error: ${errorMessage}`
      };
    }
  }
);
