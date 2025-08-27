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
        prompt: `You are a security system. Analyze the provided image from a security camera. Your task is to identify if a drone is present. If you see a drone, respond with "drone". If you see other objects like a bird or a plane, name them. If nothing is detected, respond with "none". Image: {{media url=${input.frameDataUri}}}`,
        config: {
          temperature: 0.1,
        },
      });

      const responseText = llmResponse.text.toLowerCase().trim();
      
      if (responseText.includes('drone')) {
        return {
          droneDetected: true,
          objectType: 'drone',
          explanation: 'A flying object identified as a drone was detected.',
        };
      }
      
      if (responseText.includes('bird') || responseText.includes('plane')) {
        const objectType = responseText.includes('bird') ? 'bird' : 'plane';
        return {
          droneDetected: false,
          objectType: objectType,
          explanation: `A non-threatening flying object (${objectType}) was detected.`,
        };
      }

      return {
        droneDetected: false,
        objectType: 'none',
        explanation: 'No drone detected in the frame.',
      };

    } catch (error) {
      console.error('Error processing drone detection flow:', error);
      return {
        droneDetected: false,
        objectType: 'none',
        explanation: 'Error processing frame.',
      };
    }
  }
);
