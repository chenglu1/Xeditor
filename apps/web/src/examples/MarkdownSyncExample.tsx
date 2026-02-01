import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { ConfigurableTiptapEditor } from '@xeditor/editor';
import { Box, Grid, Typography } from '@mui/material';

export function MarkdownSyncExample() {
  const [markdown, setMarkdown] = useState(
    '# 文档标题\n\n## 一、背景\n\n简要描述文档的使用场景。\n\n## 二、主要内容\n\n使用小标题拆分章节结构。',
  );

  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'grey.50',
            p: 2,
            height: { xs: 'auto', md: 360 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Markdown 文本
          </Typography>
          <Box
            component="textarea"
            value={markdown}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setMarkdown(event.target.value)
            }
            sx={{
              flex: 1,
              width: '100%',
              resize: 'none',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              fontFamily:
                'Menlo, Monaco, Consolas, "Courier New", monospace',
              fontSize: 13,
              p: 1.25,
              bgcolor: 'background.paper',
              outline: 'none',
            }}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'grey.50',
            p: 2,
            height: { xs: 'auto', md: 360 },
            overflow: 'auto',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            编辑器预览
          </Typography>
          <ConfigurableTiptapEditor
            value={markdown}
            contentType="markdown"
            compact
            className="editor-no-border"
            onChange={(next: string) => setMarkdown(next)}
          />
        </Box>
      </Grid>
    </Grid>
  );
}
