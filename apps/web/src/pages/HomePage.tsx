import { useState } from 'react';
import {
  ConfigurableTiptapEditor,
  type EditorUpdateEvent,
} from '@chenglu1/xeditor-editor';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const FEATURES = [
  {
    icon: '✦',
    title: '纯富文本模式',
    desc: '所见即所得，适合活动页、公告通知等无需保留 Markdown 的内容。',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.06)',
    to: '/examples/richtext',
  },
  {
    icon: '⌥',
    title: 'Markdown 联动',
    desc: '同时掌控 Markdown 文本与预览，适合技术文档、接口说明。',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.06)',
    to: '/examples/markdown-sync',
  },
  {
    icon: '⊞',
    title: '双视图模式',
    desc: '左右双栏同步展示，适合知识库、规格文档等对源码有要求的场景。',
    color: '#059669',
    bg: 'rgba(5,150,105,0.06)',
    to: '/examples/dual-view',
  },
];

const CAPABILITIES = ['标题 H1–H6', '有序 / 无序列表', '任务清单', '表格（可调列宽）', 'LaTeX 数学公式', '代码块', '图片上传', '文本高亮', '链接', '文本对齐', '上标 / 下标', '折叠块'];

export function HomePage() {
  const [value, setValue] = useState(
    `# 欢迎使用 Xeditor\n\n这里是一个**实时编辑**演示，试着修改内容看看效果。\n\n## 支持的功能\n\n- 标题、列表、表格\n- LaTeX 数学公式：$E = mc^2$\n- 图片上传与链接\n- 文本高亮与对齐\n\n> 从这里开始创作你的内容吧！`,
  );
  const [demoReadOnly, setDemoReadOnly] = useState(false);

  const handleDemoUpdate = (event: EditorUpdateEvent) => {
    if (event.valueType === 'markdown') {
      setValue(event.value as string);
    }
  };

  return (
    <Box>
      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 50%, #fafafa 100%)',
          borderBottom: '1px solid rgba(148,163,184,0.12)',
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
        }}
      >
        {/* Decorative blobs */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box sx={{ maxWidth: 680, mx: 'auto', textAlign: 'center' }}>
            <Chip
              label="面向内容创作者"
              size="small"
              sx={{
                mb: 3,
                px: 1,
                background: 'linear-gradient(135deg, rgba(124,58,237,.1), rgba(168,85,247,.1))',
                color: '#7c3aed',
                border: '1px solid rgba(124,58,237,.2)',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            />
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                mb: 3,
                background: 'linear-gradient(135deg, #0f172a 30%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              面向内容创作者
              <br />
              的在线编辑器
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: 'text.secondary', mb: 5, fontSize: '1.05rem', lineHeight: 1.7 }}
            >
              基于 Tiptap v3 构建，类 Markdown 富文本体验。
              <br />
              支持标题、表格、公式、图片上传等 12+ 内容形态。
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/examples/richtext"
                sx={{ px: 4, py: 1.4, fontSize: '1rem' }}
              >
                立即体验
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://github.com/chenglu1/Xeditor"
                target="_blank"
                sx={{
                  px: 4,
                  py: 1.4,
                  fontSize: '1rem',
                  borderColor: 'rgba(124,58,237,.3)',
                  color: '#7c3aed',
                  '&:hover': { borderColor: '#7c3aed', bgcolor: 'rgba(124,58,237,.04)' },
                }}
              >
                GitHub 仓库 ↗
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ── Feature Cards ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 1, textAlign: 'center' }}
        >
          三种编辑模式
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 5, textAlign: 'center', letterSpacing: '-0.02em' }}
        >
          为不同创作场景设计
        </Typography>

        <Grid container spacing={3}>
          {FEATURES.map(({ icon, title, desc, color, bg, to }) => (
            <Grid item xs={12} md={4} key={title}>
              <Paper
                elevation={0}
                component={RouterLink}
                to={to}
                sx={{
                  display: 'block',
                  textDecoration: 'none',
                  p: 3.5,
                  height: '100%',
                  border: '1px solid rgba(148,163,184,0.15)',
                  bgcolor: '#fff',
                  transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: color,
                    boxShadow: `0 8px 30px -6px ${color}22`,
                    transform: 'translateY(-3px)',
                    bgcolor: bg,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: bg,
                    border: `1px solid ${color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color,
                    mb: 2.5,
                  }}
                >
                  {icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '1rem' }}>
                  {title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {desc}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 2.5, color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  查看示例 →
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Live Demo ── */}
      <Box sx={{ bgcolor: 'rgba(248,250,252,1)', borderTop: '1px solid rgba(148,163,184,0.1)', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 1 }}
            >
              在线体验
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              双视图实时演示
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  overflow: 'hidden',
                  border: '1px solid rgba(148,163,184,0.18)',
                  boxShadow: '0 4px 24px -4px rgba(15,23,42,.08)',
                }}
              >
                {/* Mock browser bar */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.2,
                    bgcolor: '#f8fafc',
                    borderBottom: '1px solid rgba(148,163,184,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                  }}
                >
                  {['#f87171', '#fbbf24', '#34d399'].map((c) => (
                    <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
                  ))}
                  <Box
                    sx={{
                      ml: 1.5,
                      flex: 1,
                      maxWidth: 240,
                      height: 22,
                      borderRadius: '6px',
                      bgcolor: '#e2e8f0',
                    }}
                  />
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {demoReadOnly ? '只读' : '编辑'}
                    </Typography>
                    <Button
                      size="small"
                      variant={demoReadOnly ? 'contained' : 'outlined'}
                      color={demoReadOnly ? 'error' : 'primary'}
                      onClick={() => setDemoReadOnly((v: boolean) => !v)}
                      sx={{ borderRadius: 999, px: 1.5, py: 0.3, fontSize: '0.72rem', minWidth: 64 }}
                    >
                      {demoReadOnly ? '启用' : '禁用'}
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  <ConfigurableTiptapEditor
                    value={value}
                    valueType="markdown"
                    dualView
                    readOnly={demoReadOnly}
                    onUpdate={handleDemoUpdate}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: '1px solid rgba(148,163,184,0.15)',
                  bgcolor: '#fff',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                  📄 Markdown 输出
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: '"JetBrains Mono", Menlo, monospace',
                    fontSize: '0.78rem',
                    lineHeight: 1.75,
                    flex: 1,
                    overflow: 'auto',
                    borderRadius: 2,
                    bgcolor: '#0f172a',
                    color: '#94a3b8',
                    border: '1px solid rgba(148,163,184,0.1)',
                  }}
                >
                  {value}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Capabilities ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 1 }}
          >
            内容形态
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            12+ 种内容形态开箱即用
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
          {CAPABILITIES.map((cap) => (
            <Box
              key={cap}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: '999px',
                border: '1px solid rgba(124,58,237,0.2)',
                bgcolor: 'rgba(124,58,237,0.04)',
                color: '#5b21b6',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.18s',
                '&:hover': {
                  bgcolor: 'rgba(124,58,237,0.1)',
                  borderColor: 'rgba(124,58,237,0.4)',
                  transform: 'scale(1.04)',
                },
                cursor: 'default',
              }}
            >
              {cap}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
