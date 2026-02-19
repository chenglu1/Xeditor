import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
} from '@mui/material';
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RichtextPage } from './pages/RichtextPage';
import { MarkdownSyncPage } from './pages/MarkdownSyncPage';
import { DualViewPage } from './pages/DualViewPage';

const GITHUB_REPO_URL = 'https://github.com/chenglu1/Xeditor';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    secondary: {
      main: '#f97316',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 9999, fontWeight: 600 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 6 },
      },
    },
  },
});

function NavBar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px)',
        backgroundColor: isHome ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid rgba(148,163,184,0.15)',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              X
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}
            >
              Xeditor
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
            {[
              { label: '富文本', to: '/examples/richtext' },
              { label: 'Markdown', to: '/examples/markdown-sync' },
              { label: '双视图', to: '/examples/dual-view' },
            ].map(({ label, to }) => (
              <Button
                key={to}
                component={RouterLink}
                to={to}
                size="small"
                sx={{
                  color: location.pathname === to ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === to ? 700 : 500,
                  px: 1.5,
                  '&:hover': { color: 'primary.main', bgcolor: 'rgba(124,58,237,0.06)' },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Button
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="small"
            sx={{ ml: 1, px: 2 }}
          >
            GitHub
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Google Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />

        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/examples/richtext" element={<RichtextPage />} />
            <Route path="/examples/markdown-sync" element={<MarkdownSyncPage />} />
            <Route path="/examples/dual-view" element={<DualViewPage />} />
          </Routes>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid rgba(148,163,184,0.15)',
            py: 4,
            mt: 'auto',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  X
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Xeditor · 面向内容创作者的在线编辑器
                </Typography>
              </Box>
              <Typography variant="body2" color="text.disabled">
                © {new Date().getFullYear()} MIT License
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
