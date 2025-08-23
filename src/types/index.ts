export interface DetectionEvent {
  id: string;
  timestamp: string; // ISO string
  explanation: string;
  frameDataUri: string;
  objectType: string;
}
