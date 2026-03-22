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
import type { EditorUpdateEvent } from '@chenglu1/xeditor-editor';

import { ConfigurableTiptapEditor } from '../components/LocalizedEditor';
import { handleDemoImageUpload } from '../lib/demo-upload';

const USE_CASES = ['需要导出 Markdown 的知识库系统', '产品/设计/研发协同撰写的规格文档', '需要严格版本管理和审阅的说明文档'];

export function DualViewPage() {
  const [disabled, setDisabled] = useState(false);
  const [content, setContent] = useState(
    `# 双视图演示\n\n左侧为富文本编辑器，右侧为 Markdown 源码，实时联动。\n\n## 特性\n\n- 富文本操作实时同步到 Markdown\n- Markdown 编辑实时同步到富文本\n- 支持数学公式：$f(x) = x^2 + 1$`,
  );

  const handleContentUpdate = (event: EditorUpdateEvent) => {
    if (event.valueType === 'markdown') {
      setContent(event.value as string);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" underline="hover" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            首页
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>双视图模式</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f0fdf4 100%)',
            border: '1px solid rgba(5,150,105,0.2)',
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
              background: 'radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              双视图模式
            </Typography>
            <Chip
              label="双栏编辑"
              size="small"
              sx={{
                bgcolor: 'rgba(5,150,105,0.1)',
                color: '#047857',
                fontWeight: 700,
                border: '1px solid rgba(5,150,105,0.2)',
              }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, lineHeight: 1.7 }}>
            富文本编辑器与 Markdown 文本同时展示，实时联动。适合对内容结构和底层 Markdown
            都有要求的知识库、内部 Wiki、产品说明等场景。
          </Typography>
        </Box>

        <Grid container spacing={3}>
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
                  双视图联动编辑
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {disabled ? '禁用模式' : '编辑模式'}
                  </Typography>
                  <Button
                    size="small"
                    variant={disabled ? 'contained' : 'outlined'}
                    color={disabled ? 'error' : 'primary'}
                    onClick={() => setDisabled((v: boolean) => !v)}
                    sx={{ borderRadius: 999, px: 2, minWidth: 80 }}
                  >
                    {disabled ? '启用编辑' : '禁用编辑'}
                  </Button>
                </Box>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  左侧专注富文本排版，右侧随时查看与调整 Markdown 文本，确保兼容性与可读性。
                </Typography>
                <ConfigurableTiptapEditor
                  value={content}
                  valueType="markdown"
                  presets={['base', 'formatting', 'table', 'math', 'media', 'markdownDialect']}
                  dualView
                  disabled={disabled}
                  uploadHandler={handleDemoImageUpload}
                  onUpdate={handleContentUpdate}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid rgba(148,163,184,0.15)', bgcolor: '#fff' }}
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
                      bgcolor: 'rgba(5,150,105,0.05)',
                      border: '1px solid rgba(5,150,105,0.2)',
                      color: '#047857',
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
