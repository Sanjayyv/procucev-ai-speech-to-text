
import { useRef, useState, useEffect } from 'react';
import { saveTranscription } from '../../services/authService';
import Navbar from '../../components/Navbar';

import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack,
  Container,
  Tooltip,
} from '@mui/material';

import Mic from '@mui/icons-material/Mic';
import Stop from '@mui/icons-material/Stop';
import GraphicEq from '@mui/icons-material/GraphicEq';
import Save from '@mui/icons-material/Save';
import Delete from '@mui/icons-material/Delete';
import AccessTime from '@mui/icons-material/AccessTime';
import CheckCircle from '@mui/icons-material/CheckCircle';
import WifiTethering from '@mui/icons-material/WifiTethering';

import {
  convertToPCM16,
  pcmToBase64,
} from '../../utils/audioUtils';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`;
};

function Dashboard() {
  const [status, setStatus] = useState('idle');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (status !== 'recording' || !recordingStartTime) return;

    const interval = setInterval(() => {
      setElapsedTime(
        Math.floor((Date.now() - recordingStartTime) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [status, recordingStartTime]);

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    setIsSaved(false);
    try {
      setError('');
      setSaveMessage('');
      setFinalTranscript('');
      setInterimTranscript('');
      setRecordingDuration(0);
      setElapsedTime(0);
      setRecordingStartTime(null);
      setStatus('connecting');

      const socket = new WebSocket(
        'ws://localhost:5000/ws/transcription'
      );

      socketRef.current = socket;

      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'ready') {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });

            streamRef.current = stream;

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const source =
              audioContext.createMediaStreamSource(stream);

            sourceRef.current = source;

            const processor = audioContext.createScriptProcessor(
              4096,
              1,
              1
            );

            processorRef.current = processor;

            processor.onaudioprocess = (audioEvent) => {
              if (socket.readyState !== WebSocket.OPEN) return;

              const inputData =
                audioEvent.inputBuffer.getChannelData(0);

              const pcmData = convertToPCM16(
                inputData,
                audioContext.sampleRate
              );

              socket.send(
                JSON.stringify({
                  type: 'audio',
                  data: pcmToBase64(pcmData),
                })
              );
            };

            source.connect(processor);

            const gain = audioContext.createGain();
            gain.gain.value = 0;

            processor.connect(gain);
            gain.connect(audioContext.destination);

            const startTime = Date.now();
            setRecordingStartTime(startTime);
            setStatus('recording');
          } catch (micError) {
            setError(
              micError.message || 'Unable to access microphone'
            );

            socket.close();
            cleanupAudio();
            setStatus('idle');
          }
        }

        if (data.type === 'interim') {
          setInterimTranscript(data.text);
        }

        if (data.type === 'final') {
          setFinalTranscript((previous) =>
            previous + data.text
          );
          setInterimTranscript('');
        }

        if (data.type === 'error') {
          setError(data.message);
        }

        if (data.type === 'stopped') {
          setStatus('idle');
        }
      };

      socket.onerror = () => {
        setError('WebSocket connection failed.');
        cleanupAudio();
        setStatus('idle');
      };

      socket.onclose = () => {
        cleanupAudio();
        setStatus('idle');
      };
    } catch (err) {
      setError(err.message || 'Unable to start recording');
      cleanupAudio();
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    cleanupAudio();

    if (recordingStartTime) {
      const duration = Math.floor(
        (Date.now() - recordingStartTime) / 1000
      );

      setRecordingDuration(duration);
      setElapsedTime(duration);
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: 'stop' })
      );
    }

    setStatus('idle');
    setRecordingStartTime(null);
  };

const handleSaveTranscription = async () => {
  const transcript = finalTranscript.trim();

  if (!transcript || isSaved || saving) return;

  try {
    setSaving(true);
    setError('');
    setSaveMessage('');

    const result = await saveTranscription({
      title: `Transcription ${new Date().toLocaleString()}`,
      transcript,
      language: 'Multilingual',
      durationSeconds: recordingDuration,
    });

    setIsSaved(true);

    setSaveMessage(
      result.message || 'Transcription saved successfully!'
    );
  } catch (error) {
    setError(
      error.response?.data?.message ||
      'Unable to save transcription'
    );
  } finally {
    setSaving(false);
  }
};
  const clearTranscript = () => {
    setIsSaved(false);
    setFinalTranscript('');
    setInterimTranscript('');
    setSaveMessage('');
    setError('');
  };

  const isRecording = status === 'recording';
  const hasTranscript = Boolean(
    finalTranscript.trim() || interimTranscript.trim()
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5F7FB',
        pb: 6,
      }}
    >
      <Navbar />

      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexWrap: 'wrap',
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#172033',
                letterSpacing: '-1px',
                mb: 1,
              }}
            >
              Speech to Text
            </Typography>

            <Typography color="text.secondary">
              Convert your voice into accurate multilingual text
              with AI-powered transcription.
            </Typography>
          </Box>

          <Chip
            icon={<WifiTethering />}
            label="AI Transcription"
            sx={{
              backgroundColor: '#E8F0FF',
              color: '#245BDB',
              fontWeight: 600,
              borderRadius: 2,
              px: 1,
            }}
          />
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Recording Card */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E6EAF0',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            mb: 3,
            textAlign: 'center',
            background: 'linear-gradient(145deg, #FFFFFF, #F9FBFF)',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{ mb: 3 }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                backgroundColor: isRecording ? '#FEECEC' : '#EAF1FF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <GraphicEq
                sx={{
                  fontSize: 38,
                  color: isRecording ? '#E5484D' : '#2563EB',
                }}
              />
            </Box>
          </Stack>

          <Chip
            size="small"
            label={
              status === 'recording'
                ? 'RECORDING LIVE'
                : status === 'connecting'
                  ? 'CONNECTING'
                  : 'READY TO RECORD'
            }
            sx={{
              mb: 2,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: isRecording ? '#D32F2F' : '#2563EB',
              backgroundColor: isRecording ? '#FEECEC' : '#EAF1FF',
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#172033',
              mb: 1,
            }}
          >
            {isRecording
              ? 'Listening to your voice'
              : status === 'connecting'
                ? 'Connecting to AI service'
                : 'Ready to transcribe'}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {isRecording
              ? 'Speak naturally. Your words will appear below.'
              : 'Start recording and allow microphone access to begin.'}
          </Typography>

          {/* Waveform */}
          <Box
            sx={{
              height: 65,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '5px',
              mb: 3,
            }}
          >
            {Array.from({ length: 25 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 5,
                  height: isRecording
                    ? `${15 + ((index * 17) % 35)}px`
                    : '7px',
                  borderRadius: 5,
                  backgroundColor: isRecording
                    ? '#2563EB'
                    : '#C8D6F5',
                  animation: isRecording
                    ? `wave 0.7s ease-in-out ${index * 0.04}s infinite alternate`
                    : 'none',
                  '@keyframes wave': {
                    from: { transform: 'scaleY(0.35)' },
                    to: { transform: 'scaleY(1)' },
                  },
                }}
              />
            ))}
          </Box>

          {isRecording && (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <AccessTime
                sx={{ color: '#64748B', fontSize: 20 }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#172033',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatTime(elapsedTime)}
              </Typography>
            </Stack>
          )}

          {status === 'connecting' ? (
            <CircularProgress />
          ) : isRecording ? (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<Stop />}
              onClick={stopRecording}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Stop Recording
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<Mic />}
              onClick={startRecording}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 5px 15px rgba(37,99,235,0.25)',
              }}
            >
              Start Recording
            </Button>
          )}
        </Paper>

        {/* Transcription Card */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E6EAF0',
            borderRadius: 4,
            p: { xs: 2.5, md: 3.5 },
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#172033' }}
              >
                Live Transcription
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Your transcribed speech will appear here.
              </Typography>
            </Box>

            <Tooltip title="Clear transcription">
              <span>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<Delete />}
                  onClick={clearTranscript}
                  disabled={!hasTranscript || isRecording}
                  sx={{ textTransform: 'none' }}
                >
                  Clear
                </Button>
              </span>
            </Tooltip>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              minHeight: 190,
              p: 2.5,
              backgroundColor: '#F8FAFC',
              border: '1px solid #EDF0F5',
              borderRadius: 3,
            }}
          >
            {hasTranscript ? (
              <Typography
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 2,
                  fontSize: '1rem',
                  color: '#273449',
                }}
              >
                {finalTranscript}
                {interimTranscript && (
                  <Box
                    component="span"
                    sx={{ color: '#94A3B8', fontStyle: 'italic' }}
                  >
                    {' '}{interimTranscript}
                  </Box>
                )}
              </Typography>
            ) : (
              <Box
                sx={{
                  minHeight: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                }}
              >
                <GraphicEq sx={{ fontSize: 38, mb: 1, opacity: 0.5 }} />
                <Typography color="text.secondary">
                  Your transcription will appear here...
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Start recording to see live results
                </Typography>
              </Box>
            )}
          </Box>

          {/* Transcription Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mt: 3,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTime sx={{ color: '#64748B', fontSize: 19 }} />
              <Typography variant="body2" color="text.secondary">
                Duration: {formatTime(recordingDuration)}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={isSaved ? <CheckCircle /> : <Save />}
              onClick={handleSaveTranscription}
              disabled={
                saving ||
                isSaved ||
                !finalTranscript.trim() ||
                status === 'recording' ||
                status === 'connecting'
              }
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {saving? 'Saving...': isSaved? 'Saved Successfully': 'Save Transcription'}
            </Button>
          </Box>

          {saveMessage && (
            <Alert
              severity="success"
              icon={<CheckCircle />}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              {saveMessage}
            </Alert>
          )}
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.disabled"
          textAlign="center"
          sx={{ mt: 4 }}
        >
          Procucev AI · Multilingual Speech Recognition
        </Typography>
      </Container>
    </Box>
  );
}

export default Dashboard;
