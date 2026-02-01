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
import { RichtextExample } from '../examples/RichtextExample';

export function RichtextPage() {
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
          <Typography color="text.primary">纯富文本模式</Typography>
        </Breadcrumbs>
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            纯富文本模式
          </Typography>
          <Chip
            label="页面编辑"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 720 }}
        >
          使用纯富文本编辑体验，适合写作不需要保留 Markdown 文本的场景，例如公告、
          活动页、着陆页介绍等。编辑结果通常直接发布到 H5 页面或 CMS 系统中。
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                富文本编辑体验
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                所见即所得的编辑方式，包含标题、加粗、列表、图片等常用排版能力。
              </Typography>
              <RichtextExample />
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
                transition: 'all 0.18s ease-out',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: 3,
                  bgcolor: '#fff7ed',
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                适用场景
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                适合以下类型的内容创作：
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 活动落地页、产品介绍页
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 帮助中心、公告通知
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 不需要保留 Markdown 文本的常规文案
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
