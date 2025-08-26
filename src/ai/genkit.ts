import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'genkitx-ollama';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama({
      models: [{name: 'llama3', type: 'generate'}],
      serverAddress: 'http://127.0.0.1:11434', // default address
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
