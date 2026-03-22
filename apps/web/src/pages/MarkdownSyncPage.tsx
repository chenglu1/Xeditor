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

const USE_CASES = ['API 文档、技术 RFC', '技术博客、知识库文章', '需要长期维护的项目说明'];

export function MarkdownSyncPage() {
  const [disabled, setDisabled] = useState(false);
  const [content, setContent] = useState(
    `# Markdown 联动演示\n\n在左侧编辑器输入内容，右侧可查看 Markdown 源码。\n\n## 支持的特性\n\n- **加粗**、*斜体*、~~删除线~~\n- 代码块与行内代码\n- 表格与任务清单`,
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
          <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Markdown 联动模式</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #f0f9ff 100%)',
            border: '1px solid rgba(8,145,178,0.2)',
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
              background: 'radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Markdown 联动模式
            </Typography>
            <Chip
              label="技术文档"
              size="small"
              sx={{
                bgcolor: 'rgba(8,145,178,0.1)',
                color: '#0369a1',
                fontWeight: 700,
                border: '1px solid rgba(8,145,178,0.2)',
              }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, lineHeight: 1.7 }}>
            一边编辑 Markdown 文本，一边通过编辑器预览调优排版，兼顾源码可控与书写体验，
            适合技术文档、接口说明和长期维护的项目说明。
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
                  Markdown 联动编辑
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
                  在保持 Markdown 文本可控的同时，通过编辑器预览快速微调内容结构与排版。
                </Typography>
                <ConfigurableTiptapEditor
                  value={content}
                  valueType="markdown"
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
                      bgcolor: 'rgba(8,145,178,0.05)',
                      border: '1px solid rgba(8,145,178,0.2)',
                      color: '#0369a1',
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
