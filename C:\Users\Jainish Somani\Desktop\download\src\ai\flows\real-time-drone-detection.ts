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

const detectDronePrompt = ai.definePrompt({
  name: 'detectDronePrompt',
  input: {schema: RealTimeDroneDetectionInputSchema},
  output: {schema: RealTimeDroneDetectionOutputSchema},
  prompt: `You are an expert in analyzing webcam feeds for drone and other flying object detection.

  Analyze the following webcam frame and determine if a drone or another flying object is present.

  Webcam Frame: {{media url=frameDataUri}}

  1.  If a drone is detected, set 'droneDetected' to true, 'objectType' to 'drone', and provide an explanation.
  2.  If a flying object that is NOT a drone is detected (e.g., a bird, airplane, helicopter), set 'droneDetected' to false, set 'objectType' to the identified object (e.g., 'bird', 'plane'), and provide an explanation of what was detected.
  3.  If no flying object is detected, set 'droneDetected' to false and 'objectType' to 'none'.

  Consider factors like object size, motion patterns, and typical shapes. Respond in JSON format.
`,
});

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
        prompt: `Is there a drone, bird, plane, or other flying object in this image? Respond in JSON format like this: {"droneDetected": boolean, "objectType": "drone" | "bird" | "plane" | "none", "explanation": "your detailed explanation"}. Image: {{media url=${input.frameDataUri}}}`,
        config: {
          temperature: 0.1,
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
