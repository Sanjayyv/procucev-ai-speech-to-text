
const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const { connectToGemini } = require('../services/geminiService');

const getTokenFromCookie = (cookieHeader = '') => {
  const tokenCookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('token='));

  return tokenCookie
    ? decodeURIComponent(tokenCookie.substring(6))
    : null;
};

const setupTranscriptionSocket = (server) => {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 1024 * 1024,
  });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, 'http://localhost');

    if (url.pathname !== '/ws/transcription') {
      socket.destroy();
      return;
    }

    try {
      const token = getTokenFromCookie(request.headers.cookie);

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      jwt.verify(token, process.env.JWT_SECRET);

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } catch (error) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', async (ws) => {
    let geminiSession;

    const sendToClient = (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    };

    try {
      geminiSession = await connectToGemini(
        (transcript) => sendToClient(transcript),
        (error) => {
          sendToClient({
            type: 'error',
            message: error.message || 'Gemini connection error',
          });
        }
      );

      sendToClient({
        type: 'ready',
        message: 'Transcription session ready',
      });

      ws.on('message', (rawMessage) => {
        try {
          const message = JSON.parse(rawMessage.toString());

          if (message.type === 'audio') {
            if (!message.data) return;

            geminiSession.sendRealtimeInput({
              audio: {
                data: message.data,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          }

          if (message.type === 'stop') {
            geminiSession?.close();
            geminiSession = null;

            sendToClient({
              type: 'stopped',
              message: 'Transcription stopped',
            });
          }
        } catch (error) {
          sendToClient({
            type: 'error',
            message: 'Unable to process audio data',
          });
        }
      });

      ws.on('close', () => {
        geminiSession?.close();
        geminiSession = null;
        console.log('Transcription client disconnected');
      });

    } catch (error) {
      console.error('Transcription setup error:', error);

      sendToClient({
        type: 'error',
        message: 'Unable to start transcription',
      });

      ws.close();
    }
  });

  console.log('Transcription WebSocket initialized');
};

module.exports = setupTranscriptionSocket;
