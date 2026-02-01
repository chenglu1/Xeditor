import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Chip,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { MarkdownSyncExample } from '../examples/MarkdownSyncExample';

export function MarkdownSyncPage() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            color="inherit"
          >
            首页
          </Link>
          <Typography color="text.primary">Markdown 联动模式</Typography>
        </Breadcrumbs>
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Markdown 联动模式
          </Typography>
          <Chip label="技术文档" size="small" color="primary" variant="outlined" />
          <Chip label="博客写作" size="small" variant="outlined" />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 720 }}
        >
          一边编辑 Markdown 文本，一边使用编辑器预览和微调。适合对 Markdown 语法有依赖、
          但又希望拥有更舒适编辑体验的技术博客、接口文档、产品说明书等场景。
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <MarkdownSyncExample />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                适用场景
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                推荐用于以下内容类型：
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · API 文档、技术 RFC
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 技术博客、知识库文章
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 需要长期维护的 Markdown 项目说明
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
