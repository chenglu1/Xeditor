import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
  Grid,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  ConfigurableTiptapEditor,
  type EditorUpdateEvent,
} from '@chenglu1/xeditor-editor';

const USE_CASES = ['活动落地页、产品介绍页', '帮助中心、公告通知', '不需保留 Markdown 的常规文案'];

export function RichtextPage() {
  const [readOnly, setReadOnly] = useState(false);
  const [content, setContent] = useState('# 页面标题\n\n在这里开始你的内容，例如产品介绍或活动说明。');
  const handleContentUpdate = (event: EditorUpdateEvent) => {
    if (event.valueType === 'markdown') {
      setContent(event.value as string);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" underline="hover" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            首页
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>纯富文本模式</Typography>
        </Breadcrumbs>

        {/* Page header */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)',
            border: '1px solid rgba(167,139,250,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              纯富文本模式
            </Typography>
            <Chip
              label="页面编辑"
              size="small"
              sx={{
                bgcolor: 'rgba(124,58,237,0.1)',
                color: '#7c3aed',
                fontWeight: 700,
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, lineHeight: 1.7 }}>
            使用纯富文本编辑体验，适合写作不需要保留 Markdown 文本的场景，例如公告、
            活动页、着陆页介绍等。编辑结果通常直接发布到 H5 页面或 CMS 系统中。
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Editor */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                overflow: 'hidden',
                border: '1px solid rgba(148,163,184,0.18)',
                boxShadow: '0 4px 24px -4px rgba(15,23,42,.07)',
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid rgba(148,163,184,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#fafafa',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  富文本编辑体验
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {readOnly ? '只读模式' : '编辑模式'}
                  </Typography>
                  <Button
                    size="small"
                    variant={readOnly ? 'contained' : 'outlined'}
                    color={readOnly ? 'error' : 'primary'}
                    onClick={() => setReadOnly((v: boolean) => !v)}
                    sx={{ borderRadius: 999, px: 2, minWidth: 80 }}
                  >
                    {readOnly ? '启用编辑' : '禁用编辑'}
                  </Button>
                </Box>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  包含标题、加粗、列表、图片等常用排版能力，直接编辑即可。
                </Typography>
                <ConfigurableTiptapEditor
                  value={content}
                  valueType="markdown"
                  readOnly={readOnly}
                  onUpdate={handleContentUpdate}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Use cases */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(148,163,184,0.15)',
                bgcolor: '#fff',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                💡 适用场景
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {USE_CASES.map((c) => (
                  <Box
                    key={c}
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderRadius: '999px',
                      bgcolor: 'rgba(124,58,237,0.05)',
                      border: '1px solid rgba(124,58,237,0.15)',
                      color: '#5b21b6',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    {c}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
