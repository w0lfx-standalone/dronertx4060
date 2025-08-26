import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'genkitx-ollama';

// This is the model the app will use.
// If you have Ollama running, it will use a local model.
// If not, it will fall back to the Google AI model.
// You can change 'llama3' to any other model you have downloaded.
const mainModel = 'llama3';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama({
      models: [{name: mainModel, type: 'generate'}],
      serverAddress: 'http://127.0.0.1:11434', // default address
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
