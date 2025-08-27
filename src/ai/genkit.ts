import {genkit} from 'genkit';
import {ollama} from 'genkitx-ollama';

export const ai = genkit({
  plugins: [
    ollama({
      models: [{name: 'llama3', type: 'generate'}],
      serverAddress: 'http://127.0.0.1:11434',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
