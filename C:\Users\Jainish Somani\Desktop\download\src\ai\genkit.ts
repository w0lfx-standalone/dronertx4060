'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'genkitx-ollama';

// This is the model the app will use.
// If you have Ollama running, it will use a local model.
// If not, it will fall back to the Google AI model.
// You can change 'llama3' to any other model you have downloaded.
const mainModel = ollama('llama3', {
  serverAddress: 'http://127.0.0.1:11434', // default address
});

export const ai = genkit({
  plugins: [
    googleAI(),
    // The ollama plugin is configured with the model instance.
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
