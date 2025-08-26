'use server';
/**
 * @fileOverview This file defines a Genkit flow for real-time drone detection using webcam feed analysis.
 *
 * - realTimeDroneDetection - A function that processes webcam feed to detect drones and provide alerts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RealTimeDroneDetectionInputSchema, RealTimeDroneDetectionOutputSchema, type RealTimeDroneDetectionInput, type RealTimeDroneDetectionOutput } from '@/types';


export async function realTimeDroneDetection(input: RealTimeDroneDetectionInput): Promise<RealTimeDroneDetectionOutput> {
  return realTimeDroneDetectionFlow(input);
}

const realTimeDroneDetectionFlow = ai.defineFlow(
  {
    name: 'realTimeDroneDetectionFlow',
    inputSchema: RealTimeDroneDetectionInputSchema,
    outputSchema: RealTimeDroneDetectionOutputSchema,
  },
  async (input) => {
    try {
      const llmResponse = await ai.generate({
        model: 'ollama/llama3',
        prompt: `Analyze the image provided and determine if a drone is present. Answer with only "yes" or "no". Image: {{media url=${input.frameDataUri}}}`,
        config: {
          temperature: 0.1,
        },
      });

      const responseText = llmResponse.text.toLowerCase().trim();
      
      if (responseText.includes('yes')) {
        return {
          droneDetected: true,
          objectType: 'drone',
          explanation: 'A flying object identified as a drone was detected.',
        };
      }
      
      // If the answer is not 'yes', assume no drone was detected.
      return {
        droneDetected: false,
        objectType: 'none',
        explanation: 'No drone detected in the frame.',
      };

    } catch (error) {
      console.error('Error processing drone detection flow:', error);
      // Return a default "nothing detected" response if an error occurs
      return {
        droneDetected: false,
        objectType: 'none',
        explanation: 'Error processing frame.',
      };
    }
  }
);
