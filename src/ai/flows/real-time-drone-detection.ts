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
      "A frame from the webcam feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RealTimeDroneDetectionInput = z.infer<typeof RealTimeDroneDetectionInputSchema>;

const RealTimeDroneDetectionOutputSchema = z.object({
  droneDetected: z.boolean().describe('Whether a drone is detected in the frame.'),
  explanation: z.string().optional().describe('Optional explanation of why the drone was detected.')
});
export type RealTimeDroneDetectionOutput = z.infer<typeof RealTimeDroneDetectionOutputSchema>;

export async function realTimeDroneDetection(input: RealTimeDroneDetectionInput): Promise<RealTimeDroneDetectionOutput> {
  return realTimeDroneDetectionFlow(input);
}

const detectDronePrompt = ai.definePrompt({
  name: 'detectDronePrompt',
  input: {schema: RealTimeDroneDetectionInputSchema},
  output: {schema: RealTimeDroneDetectionOutputSchema},
  prompt: `You are an expert in analyzing webcam feeds for drone detection.

  Analyze the following webcam frame and determine if a drone is present. Provide a brief explanation if a drone is detected.

  Webcam Frame: {{media url=frameDataUri}}

  Consider factors like object size, motion patterns, and typical drone shapes. Return droneDetected as true if a drone is detected, otherwise false.
  If droneDetected is true, populate the explanation with details on contributing factors like size, shape and motion.
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
