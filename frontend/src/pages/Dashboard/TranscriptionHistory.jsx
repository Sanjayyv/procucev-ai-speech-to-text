
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Divider,
  MenuItem,
  Tooltip,
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Search from '@mui/icons-material/Search';
import History from '@mui/icons-material/History';
import Mic from '@mui/icons-material/Mic';
import AccessTime from '@mui/icons-material/AccessTime';
import Description from '@mui/icons-material/Description';
import Close from '@mui/icons-material/Close';
import Save from '@mui/icons-material/Save';

import {
  getTranscriptions,
  deleteTranscription,
  updateTranscription,
} from '../../services/authService';

const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(
    secs
  ).padStart(2, '0')}`;
};

const formatDate = (date) => {
  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable';
  }

  return parsedDate.toLocaleString();
};

function TranscriptionHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getTranscriptions();
      setHistory(response.transcriptions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load transcription history'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    const filtered = history.filter((item) => {
      return (
        (item.title || '').toLowerCase().includes(searchValue) ||
        (item.transcript || '').toLowerCase().includes(searchValue)
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime() || 0;
      const dateB = new Date(b.created_at).getTime() || 0;

      return sortOrder === 'newest'
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [history, search, sortOrder]);

  const handleEdit = async () => {
    if (!editing?.title?.trim() || !editing?.transcript?.trim()) {
      setError('Title and transcript cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const updatedData = {
        title: editing.title.trim(),
        transcript: editing.transcript.trim(),
      };

      const response = await updateTranscription(
        editing.id,
        updatedData
      );

      const updatedRecord = response.transcription || {
        ...editing,
        ...updatedData,
      };

      setHistory((previous) =>
        previous.map((item) =>
          item.id === editing.id
            ? { ...item, ...updatedRecord }
            : item
        )
      );

      setSelected((previous) =>
        previous?.id === editing.id
          ? { ...previous, ...updatedRecord }
          : previous
      );

      setEditing(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update transcription'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      setDeletingLoading(true);
      setError('');

      await deleteTranscription(deleting.id);

      setHistory((previous) =>
        previous.filter((item) => item.id !== deleting.id)
      );

      setSelected((previous) =>
        previous?.id === deleting.id ? null : previous
      );

      setDeleting(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to delete transcription'
      );
    } finally {
      setDeletingLoading(false);
    }
  };

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
        {/* Header */}
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
              Transcription History
            </Typography>

            <Typography color="text.secondary">
              Access and manage all your saved AI transcriptions.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Mic />}
            onClick={() => navigate('/dashboard')}
            sx={{
              px: 3,
              py: 1.3,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            New Recording
          </Button>
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

        {/* Statistics */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 3,
            mb: 3,
            border: '1px solid #E6EAF0',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              backgroundColor: '#EAF1FF',
              color: '#2563EB',
            }}
          >
            <Description sx={{ fontSize: 28 }} />
          </Box>

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              color="#172033"
            >
              {history.length}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Total saved transcriptions
            </Typography>
          </Box>
        </Paper>

        {/* Search and Sorting */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            border: '1px solid #E6EAF0',
            borderRadius: 3,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title or transcript..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 170 } }}
              label="Sort by"
            >
              <MenuItem value="newest">Newest first</MenuItem>
              <MenuItem value="oldest">Oldest first</MenuItem>
            </TextField>
          </Stack>
        </Paper>

        {/* History List */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color="#172033"
          >
            Your Transcriptions
          </Typography>

          <Chip
            label={`${filteredHistory.length} records`}
            size="small"
            sx={{
              color: '#2563EB',
              backgroundColor: '#EAF1FF',
              fontWeight: 600,
            }}
          />
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredHistory.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 7 },
              textAlign: 'center',
              border: '1px solid #E6EAF0',
              borderRadius: 4,
            }}
          >
            <History
              sx={{
                fontSize: 60,
                color: '#94A3B8',
                mb: 2,
              }}
            />

            <Typography
              variant="h6"
              fontWeight={700}
              color="#172033"
              mb={1}
            >
              {search
                ? 'No matching transcriptions'
                : 'No transcriptions yet'}
            </Typography>

            <Typography color="text.secondary" mb={3}>
              {search
                ? 'Try searching with a different keyword.'
                : 'Your saved recordings will appear here. Start your first recording now.'}
            </Typography>

            {!search && (
              <Button
                variant="contained"
                startIcon={<Mic />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Start Recording
              </Button>
            )}
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredHistory.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  border: '1px solid #E6EAF0',
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#B8CCFA',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.06)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="#172033"
                      sx={{
                        fontSize: '1.05rem',
                        overflowWrap: 'anywhere',
                        mb: 1,
                      }}
                    >
                      {item.title || 'Untitled Transcription'}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={2}
                      useFlexGap
                      flexWrap="wrap"
                      sx={{ mb: 2 }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                      >
                        <History
                          sx={{ fontSize: 17, color: '#64748B' }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDate(item.created_at)}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                      >
                        <AccessTime
                          sx={{ fontSize: 17, color: '#64748B' }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDuration(item.duration_seconds)}
                        </Typography>
                      </Stack>

                      <Chip
                        label={item.language || 'Multilingual'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.8,
                        overflowWrap: 'anywhere',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.transcript}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View transcription">
                      <IconButton
                        color="primary"
                        onClick={() => setSelected(item)}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit transcription">
                      <IconButton
                        color="default"
                        onClick={() => {
                          setError('');
                          setEditing({ ...item });
                        }}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete transcription">
                      <IconButton
                        color="error"
                        onClick={() => setDeleting(item)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

      {/* View Dialog */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          {selected?.title}

          <IconButton onClick={() => setSelected(null)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 2 }}
            flexWrap="wrap"
          >
            <Chip label={formatDate(selected?.created_at)} />
            <Chip
              label={formatDuration(selected?.duration_seconds)}
            />
            <Chip label={selected?.language || 'Multilingual'} />
          </Stack>

          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 2,
              color: '#273449',
              overflowWrap: 'anywhere',
            }}
          >
            {selected?.transcript}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelected(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle fontWeight={700}>
          Edit Transcription
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Transcription title"
              value={editing?.title || ''}
              onChange={(e) =>
                setEditing((previous) => ({
                  ...previous,
                  title: e.target.value,
                }))
              }
            />

            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Transcript"
              value={editing?.transcript || ''}
              onChange={(e) =>
                setEditing((previous) => ({
                  ...previous,
                  transcript: e.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setEditing(null)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleEdit}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={Boolean(deleting)}
        onClose={() => !deletingLoading && setDeleting(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>
          Delete Transcription?
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete
            {' '}
            <strong>{deleting?.title}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleting(null)}
            disabled={deletingLoading}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={deletingLoading}
          >
            {deletingLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TranscriptionHistory;
