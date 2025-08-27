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
    input: { schema: RealTimeDroneDetectionInputSchema },
    output: { schema: RealTimeDroneDetectionOutputSchema },
    prompt: `You are a security system. Analyze the provided image from a security camera. Your task is to identify if a drone is present.
    - If you see a drone, respond with objectType: "drone".
    - If you see other non-threatening flying objects like a bird or a plane, name them (e.g., objectType: "bird").
    - If nothing of interest is detected, respond with objectType: "none".
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