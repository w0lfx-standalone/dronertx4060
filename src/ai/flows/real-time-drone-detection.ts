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
    prompt: `You are an expert system for identifying flying objects in an image. Your only task is to detect drones, birds, or planes.

- A "drone" is a flying machine with multiple rotors/propellers. If you see one, set objectType to "drone" and droneDetected to true.
- A "bird" is an animal with wings. If you see one, set objectType to "bird" and droneDetected to false.
- A "plane" is a fixed-wing aircraft. If you see one, set objectType to "plane" and droneDetected to false.
- If NO flying objects (drone, bird, or plane) are in the image, you MUST set objectType to "none" and droneDetected to false. Do not identify people, cars, or other non-flying things.

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
