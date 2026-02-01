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
import { DualViewExample } from '../examples/DualViewExample';

export function DualViewPage() {
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
          <Typography color="text.primary">双视图模式</Typography>
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
            双视图模式
          </Typography>
          <Chip
            label="双栏编辑"
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
          富文本编辑器与 Markdown 文本同时展示，实时联动。适合对内容结构和底层 Markdown
          都有要求的知识库、内部 Wiki、产品说明等场景。
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
                双视图联动编辑
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                左侧专注富文本排版，右侧随时查看与调整 Markdown 文本，确保兼容性与可读性。
              </Typography>
              <DualViewExample />
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
                特别适合以下团队使用：
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 需要导出 Markdown 的知识库系统
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 产品/设计/研发协同撰写的规格文档
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                · 需要严格版本管理和审阅的说明文档
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
