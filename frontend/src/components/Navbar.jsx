
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Container,
} from '@mui/material';

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    closeMobileMenu();

    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transcription History', path: '/history' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar
        position="static"
        elevation={2}
        sx={{
          backgroundColor: '#2563EB',
          width: '100%',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 76 },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Brand */}
            <Typography
              component={Link}
              to="/dashboard"
              variant="h5"
              sx={{
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap',
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
                flexShrink: 0,
              }}
            >
              Procucev AI
            </Typography>

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: isActive(item.path)
                      ? 'rgba(255,255,255,0.18)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Logout
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 2,
                width: 42,
                height: 42,
                fontSize: 25,
              }}
            >
              <span>☰</span>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        PaperProps={{
          sx: {
            width: { xs: '80%', sm: 320 },
            maxWidth: 320,
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            color="#2563EB"
          >
            Procucev AI
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Speech to Text Platform
          </Typography>
        </Box>

        <Divider />

        <List sx={{ px: 1.5, py: 2 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              onClick={closeMobileMenu}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                color: isActive(item.path)
                  ? '#2563EB'
                  : '#334155',
                '&.Mui-selected': {
                  backgroundColor: '#EAF1FF',
                  color: '#2563EB',
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            color="error"
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
