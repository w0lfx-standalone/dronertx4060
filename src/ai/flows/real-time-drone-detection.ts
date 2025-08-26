'use server';
/**
 * @fileOverview This file defines a Genkit flow for real-time drone detection using webcam feed analysis.
 *
 * - realTimeDroneDetection - A function that processes webcam feed to detect drones and provide alerts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RealTimeDroneDetectionInputSchema, RealTimeDroneDetectionOutputSchema, type RealTimeDroneDetectionInput, type RealTimeDroneDetectionOutput } from '@/types';
import { ollama } from 'genkitx-ollama';


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
        model: ollama('llama3'),
        prompt: `You are an expert in analyzing webcam feeds for drone and other flying object detection. Analyze the image and determine if a drone or another flying object is present. Respond in valid JSON format only, with no additional text or markdown. Example: {"droneDetected": true, "objectType": "drone", "explanation": "A small quadcopter was detected in the upper left corner."}. Image: {{media url=${input.frameDataUri}}}`,
        config: {
          temperature: 0.2,
        },
      });

      const rawText = llmResponse.text;
      
      // Clean up the model's response to make sure it's valid JSON
      const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedOutput = JSON.parse(jsonText);
      const validatedOutput = RealTimeDroneDetectionOutputSchema.parse(parsedOutput);

      return validatedOutput;

    } catch (error) {
      console.error('Error processing drone detection flow:', error);
      // Return a default "nothing detected" response if parsing fails
      return {
        droneDetected: false,
        objectType: 'none',
        explanation: 'Error processing frame.',
      };
    }
  }
);
