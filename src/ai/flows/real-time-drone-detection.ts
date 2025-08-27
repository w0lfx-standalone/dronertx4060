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
    prompt: `You are a specialized AI assistant for a flying object detection system. Your task is to analyze the image provided and classify the primary object of interest.

Follow these rules precisely:
1.  **If a DRONE is detected:** Look for manufactured objects with rigid frames, distinct propellers or rotors, and unnatural, stable, or hovering flight patterns. If a drone is detected, set objectType to "drone" and droneDetected to true.
2.  **If a BIRD is detected:** Look for organic shapes, flapping wings, and natural, often gliding, flight. If a bird is detected, set objectType to "bird" and droneDetected to false.
3.  **If a PLANE is detected:** Look for a fixed-wing aircraft with a distinct fuselage and wings. If a plane is detected, set objectType to "plane" and droneDetected to false.
4.  **If a PERSON is detected:** If you see a human face or body, you MUST set objectType to "person" and droneDetected to false.
5.  **If NOTHING is detected:** If no objects of interest (drone, bird, plane, person) are clearly visible, you MUST set objectType to "none" and droneDetected to false.

Provide a brief explanation for your classification.

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
