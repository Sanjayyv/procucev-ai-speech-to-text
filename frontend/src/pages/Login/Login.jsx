
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '../../context/ToastContext';
import { loginUser } from '../../services/authService';
import {Dialog,DialogTitle,DialogContent,DialogActions } from '@mui/material';
import {
  Box,Button,Checkbox,FormControlLabel,IconButton,InputAdornment,TextField,Typography,Alert,CircularProgress,
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MicNone from '@mui/icons-material/MicNone';
import GraphicEq from '@mui/icons-material/GraphicEq';

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [openContact, setOpenContact] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError('');
    setMessage('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: email.trim(),
        password,
      });

      if (response.success) {
        showToast('Login successful! Welcome back.', 'success');

        navigate('/dashboard', {
          replace: true,
        });
      } else {
        showToast(
          response.message || 'Unable to login. Please try again.',
          'error'
        );
      }
    } catch (error) {
      showToast(
        error.response?.data?.message ||
        'Login failed. Please check your credentials.',
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
            <MicNone />
          </Box>

          <Typography variant="h3">
            Your voice,
            <br />
            your words.
          </Typography>

          <Typography className="brand-description">
            Transform your speech into text instantly.
            Experience seamless multilingual transcription
            powered by AI.
          </Typography>

          <Box className="brand-features">
            <Typography>
              ✓ Real-time transcription
            </Typography>

            <Typography>
              ✓ Multilingual support
            </Typography>

            <Typography>
              ✓ Smart transcription history
            </Typography>
          </Box>
        </Box>

        <Typography className="brand-footer">
          © 2026 Procucev AI. All rights reserved.
        </Typography>

      </Box>

      {/* Right Login Section */}
      <Box className="auth-form-panel">

        <Box className="auth-form-wrapper">

          {/* Mobile Brand */}
          <Box className="mobile-brand">
            <GraphicEq />

            <Typography variant="h6">
              Procucev AI
            </Typography>
          </Box>

          <Typography
            variant="h4"
            className="auth-heading"
          >
            Welcome back!
          </Typography>

          <Typography className="auth-subheading">
            Enter your credentials to access your account.
          </Typography>

          {/* Validation Error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Information Message */}
          {message && (
            <Alert
              severity="info"
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
          >

            {/* Email */}
            <Typography className="field-label">
              Email address
            </Typography>

            <TextField
              fullWidth
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
              disabled={loading}
            />

            {/* Password */}
            <Typography className="field-label">
              Password
            </Typography>

            <TextField
              fullWidth
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      edge="end"
                      aria-label="Toggle password visibility"
                      disabled={loading}
                    >
                      {showPassword
                        ? <VisibilityOff />
                        : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Remember Me */}
            <Box className="form-options">

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    disabled={loading}
                  />
                }
                label="Remember me"
              />

              {/* <Button
                className="forgot-button"
                type="button"
                onClick={() =>
                  setMessage(
                    'Forgot password functionality will be added later.'
                  )
                }
                disabled={loading}
              >
                Forgot password?
              </Button> */}

              <Typography
  variant="body2"
  sx={{ textAlign: 'right', mt: 1 }}
>
  <Button
    component="button"
    className='forgot-button'
    type="button"
    onClick={() => setOpenContact(true)}
    underline="hover"
  >
    Forgot Password?
  </Button>
</Typography>

        <Dialog
          open={openContact}
          onClose={() => setOpenContact(false)}
        >
          <DialogTitle>Forgot Password?</DialogTitle>

          <DialogContent>
            Please contact the administrator to reset
            your password.

            <Typography sx={{ mt: 2 }} color="primary">
              admin@procucev.ai
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenContact(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress
                  size={23}
                  color="inherit"
                />
              ) : (
                'Sign In'
              )}
            </Button>

          </Box>

          {/* Register Link */}
          <Box className="auth-bottom-text">
            Don't have an account?
            <Link to="/register">
              Create account
            </Link>
          </Box>

        </Box>

      </Box>

    </Box>
  );
}

export default Login;
