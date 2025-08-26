'use server';
/**
 * @fileOverview This file defines a Genkit flow for real-time drone detection using webcam feed analysis.
 *
 * - realTimeDroneDetection - A function that processes webcam feed to detect drones and provide alerts.
 * - RealTimeDroneDetectionInput - The input type for the realTimeDroneDetection function, expects a data URI of a webcam frame.
 * - RealTimeDroneDetectionOutput - The return type for the realTimeDroneDetection function, indicating if a drone is detected.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeDroneDetectionInputSchema = z.object({
  frameDataUri: z
    .string()
    .describe(
      "A frame from the webcam feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    ),
});
export type RealTimeDroneDetectionInput = z.infer<typeof RealTimeDroneDetectionInputSchema>;

const RealTimeDroneDetectionOutputSchema = z.object({
  droneDetected: z.boolean().describe('Whether a drone is detected in the frame.'),
  objectType: z.string().describe('The type of object detected (e.g., "drone", "bird", "plane", "none").'),
  explanation: z.string().optional().describe('Optional explanation of why the drone was detected.')
});
export type RealTimeDroneDetectionOutput = z.infer<typeof RealTimeDroneDetectionOutputSchema>;

export async function realTimeDroneDetection(input: RealTimeDroneDetectionInput): Promise<RealTimeDroneDetectionOutput> {
  return realTimeDroneDetectionFlow(input);
}

const detectDronePrompt = ai.definePrompt({
  name: 'detectDronePrompt',
  model: 'llama3',
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
  async input => {
    const {output} = await detectDronePrompt(input);
    return output!;
  }
);
