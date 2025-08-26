import {z} from 'genkit';

export interface DetectionEvent {
  id: string;
  timestamp: string; // ISO string
  explanation: string;
  frameDataUri: string;
  objectType: string;
}

export const ExplainDroneDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the detected object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  objectSize: z.string().describe('The size of the detected object.'),
  motionPatterns: z.string().describe('The observed motion patterns of the object.'),
});
export type ExplainDroneDetectionInput = z.infer<typeof ExplainDroneDetectionInputSchema>;

export const ExplainDroneDetectionOutputSchema = z.object({
  explanation: z.string().describe('The explanation of why the object was identified as a drone.'),
});
export type ExplainDroneDetectionOutput = z.infer<typeof ExplainDroneDetectionOutputSchema>;


export const RealTimeDroneDetectionInputSchema = z.object({
  frameDataUri: z
    .string()
    .describe(
      "A frame from the webcam feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    ),
});
export type RealTimeDroneDetectionInput = z.infer<typeof RealTimeDroneDetectionInputSchema>;

export const RealTimeDroneDetectionOutputSchema = z.object({
  droneDetected: z.boolean().describe('Whether a drone is detected in the frame.'),
  objectType: z.string().describe('The type of object detected (e.g., "drone", "bird", "plane", "none").'),
  explanation: z.string().optional().describe('Optional explanation of what was detected.')
});
export type RealTimeDroneDetectionOutput = z.infer<typeof RealTimeDroneDetectionOutputSchema>;
