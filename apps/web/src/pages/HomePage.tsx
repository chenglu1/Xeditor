import { useState } from 'react';
import { ConfigurableTiptapEditor } from '@xeditor/editor';
import { Container, Box, Grid, Paper, Typography, Stack, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function HomePage() {
  const [value, setValue] = useState('# Hello from monorepo editor');

  return (
    <Box sx={{ bgcolor: 'background.paper', pb: 6 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 6, sm: 8 },
            pb: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 4 },
            textAlign: { xs: 'center', md: 'left' },
            borderRadius: 4,
            backgroundImage:
              'linear-gradient(135deg, #fef3c7 0%, #fffbeb 40%, #ffffff 100%)',
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            面向内容创作者的在线编辑器
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 640, mx: { xs: 'auto', md: 0 } }}
          >
            使用类 Markdown 的富文本编辑体验，一边创作一边预览效果。
            支持标题、列表、表格、公式、图片等常见内容形态。
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}
          >
            <Button variant="contained" size="large">
              立即开始写作
            </Button>
          </Stack>
          <Box sx={{ mt: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                快速查看不同模式示例：
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to="/examples/richtext"
                >
                  纯富文本模式
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to="/examples/markdown-sync"
                >
                  Markdown 联动模式
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to="/examples/dual-view"
                >
                  双视图模式
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ pb: 4, mt: 2 }}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                默认编辑示例（双视图）
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                使用内置的双视图模式，一边用富文本编辑，一边保持 Markdown
                内容同步。
              </Typography>
              <Box sx={{ flex: 1, minHeight: 360 }}>
                <ConfigurableTiptapEditor
                  value={value}
                  contentType="markdown"
                  dualView
                  onChange={(content: string) => setValue(content)}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 3,
                height: '100%',
                bgcolor: 'grey.50',
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                实时预览
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                这里展示当前内容的 Markdown 文本，便于复制到文档或博客系统。
              </Typography>
              <Box
                component="pre"
                className="rounded-xl border border-slate-200 bg-slate-50 shadow-inner"
                sx={{
                  m: 0,
                  p: 2,
                  whiteSpace: 'pre-wrap',
                  fontFamily:
                    'Menlo, Monaco, Consolas, "Courier New", monospace',
                  fontSize: 14,
                  maxHeight: 420,
                  overflow: 'auto',
                }}
              >
                {value}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            为不同创作场景设计
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'grey.50',
                  height: '100%',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  纯富文本模式
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  适合活动页、公告通知等无需保留 Markdown 的内容，专注所见即所得编辑体验。
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'grey.50',
                  height: '100%',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Markdown 联动模式
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  同时掌控 Markdown 文本与编辑器预览，适合技术文档、接口说明、长期维护的说明书。
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'grey.50',
                  height: '100%',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  双视图模式
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  左右双栏同时展示内容与 Markdown，适合知识库、规格文档等需要结构与源码兼顾的场景。
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

      </Container>
    </Box>
  );
}
