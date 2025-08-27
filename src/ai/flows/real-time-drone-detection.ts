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
    prompt: `You are a flying object detection system. Analyze the image and identify if it contains a drone, bird, or plane.
- If a drone (machine with rotors/propellers) is detected, set objectType to "drone" and droneDetected to true.
- If a bird is detected, set objectType to "bird" and droneDetected to false.
- If a plane is detected, set objectType to "plane" and droneDetected to false.
- If no flying objects are found, you MUST set objectType to "none" and droneDetected to false.
- Do not identify any other objects (people, cars, etc.).
- Provide a brief explanation for your detection.

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
        // Handle cases where the model returns a null or undefined output
        return {
          droneDetected: false,
          objectType: 'error',
          explanation: 'Model returned no output.',
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
      // Handle any exception during the flow execution
      return {
        droneDetected: false,
        objectType: 'error',
        explanation: 'An error occurred while processing the frame.',
        debug: `Flow error: ${errorMessage}`
      };
    }
  }
);
