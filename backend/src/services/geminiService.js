
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,

  httpOptions: {
    baseUrl: 'https://generativelanguage.googleapis.com',
    apiVersion: 'v1beta',
  },
});

const connectToGemini = async (onMessage, onError) => {
  console.log('Connecting to Gemini Live API...');

  const session = await ai.live.connect({
    model: 'gemini-3.5-transcribe-live',

    config: {
      responseModalities: ['TEXT'],

      inputAudioTranscription: {
        languageCodes: [],
        mode: 'VERBATIM',
      },
    },

    callbacks: {
      onopen: () => {
        console.log('Gemini WebSocket connected successfully');
      },

      onmessage: (message) => {
        const content = message.serverContent;

        if (!content) return;

        if (content.interimInputTranscription) {
          onMessage({
            type: 'interim',
            text: content.interimInputTranscription.text,
          });
        }

        if (content.inputTranscription) {
          onMessage({
            type: 'final',
            text: content.inputTranscription.text,
          });
        }
      },

      onerror: (error) => {
        console.error('Gemini WebSocket error:', error.message);
        onError?.(error);
      },

      onclose: (event) => {
        console.log(
          'Gemini connection closed:',
          event.code,
          event.reason
        );
      },
    },
  });

  return session;
};

module.exports = { connectToGemini };
