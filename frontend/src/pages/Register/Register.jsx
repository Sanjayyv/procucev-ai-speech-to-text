
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

import {
  Visibility,
  VisibilityOff,
  GraphicEq,
} from '@mui/icons-material';

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError('');
    setMessage('');

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.success) {
        showToast(
          'Account created successfully! You can now log in.',
          'success'
        );

        navigate('/login', { replace: true });
      } else {
        showToast(
          response.message || 'Unable to create your account.',
          'error'
        );
      }
    } catch (error) {
      showToast(
        error.response?.data?.message ||
        'Registration failed. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-container">

      {/* Left Branding Section */}
      <Box className="auth-brand-panel">

        <Box className="brand-logo">
          <Box className="brand-icon">
            <GraphicEq />
          </Box>

          <Typography variant="h5">
            Procucev <span>AI</span>
          </Typography>
        </Box>

        <Box className="brand-content">
          <Box className="brand-mic-icon">
            <GraphicEq />
          </Box>

          <Typography variant="h3">
            Start your
            <br />
            voice journey.
          </Typography>

          <Typography className="brand-description">
            Create your account and experience intelligent
            speech recognition with multilingual AI
            transcription.
          </Typography>

          <Box className="brand-features">
            <Typography>✓ Easy account setup</Typography>
            <Typography>✓ Real-time speech recognition</Typography>
            <Typography>✓ Access your history anytime</Typography>
          </Box>
        </Box>

        <Typography className="brand-footer">
          © 2026 Procucev AI. All rights reserved.
        </Typography>

      </Box>

      {/* Right Registration Section */}
      <Box className="auth-form-panel">

        <Box className="auth-form-wrapper">

          <Box className="mobile-brand">
            <GraphicEq />
            <Typography variant="h6">Procucev AI</Typography>
          </Box>

          <Typography variant="h4" className="auth-heading">
            Create an account
          </Typography>

          <Typography className="auth-subheading">
            Get started with your free account.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister}>

            <Typography className="field-label">
              Full name
            </Typography>

            <TextField
              fullWidth
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              autoComplete="name"
              disabled={loading}
            />

            <Typography className="field-label">
              Email address
            </Typography>

            <TextField
              fullWidth
              name="email"
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              autoComplete="email"
              disabled={loading}
            />

            <Typography className="field-label">
              Password
            </Typography>

            <TextField
              fullWidth
              name="password"
              placeholder="Create a password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              autoComplete="new-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      edge="end"
                      aria-label="Toggle password visibility"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography className="field-label">
              Confirm password
            </Typography>

            <TextField
              fullWidth
              name="confirmPassword"
              placeholder="Confirm your password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              autoComplete="new-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      edge="end"
                      aria-label="Toggle confirm password visibility"
                      disabled={loading}
                    >
                      {showConfirmPassword
                        ? <VisibilityOff />
                        : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="auth-submit-button"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={23} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

          </Box>

          <Box className="auth-bottom-text">
            Already have an account?
            <Link to="/login"> Sign in</Link>
          </Box>

        </Box>

      </Box>

    </Box>
  );
}

export default Register;
