import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
} from '@mui/material';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RichtextPage } from './pages/RichtextPage';
import { MarkdownSyncPage } from './pages/MarkdownSyncPage';
import { DualViewPage } from './pages/DualViewPage';

const GITHUB_REPO_URL = 'https://github.com/chenglu1/';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#f97316',
    },
    background: {
      default: '#f5f1eb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2933',
      secondary: '#6b7280',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'system-ui',
      'sans-serif',
    ].join(','),
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255, 250, 245, 0.9)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{ textTransform: 'none', fontWeight: 600, px: 0 }}
              >
                Xeditor 在线文档
              </Button>
            </Typography>
            <Button
              color="inherit"
              component={RouterLink}
              to="/examples/richtext"
              sx={{ mr: 2 }}
            >
              示例
            </Button>
            <Button
              color="primary"
              variant="contained"
              component="a"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub 仓库
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/examples/richtext" element={<RichtextPage />} />
            <Route
              path="/examples/markdown-sync"
              element={<MarkdownSyncPage />}
            />
            <Route path="/examples/dual-view" element={<DualViewPage />} />
          </Routes>
        </Box>

        <Box
          sx={{
            bgcolor: '#1c1917',
            color: 'grey.300',
            py: 3,
            mt: 'auto',
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              © {new Date().getFullYear()} Xeditor · 为个人创作者和团队提供写作体验。
            </Typography>
            <Typography variant="body2" color="grey.500">
              从日常写作到专业文档，都能保持优雅、稳定的创作流程。
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
