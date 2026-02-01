import { useState } from 'react';
import { ConfigurableTiptapEditor } from '@chenglu1/xeditor-editor';
import { Box, Typography } from '@mui/material';

export function DualViewExample() {
  const [content, setContent] = useState(
    '# 文档标题\n\n在这里体验双视图：在富文本与 Markdown 源码之间来回切换。',
  );

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: 'grey.50',
        p: 2,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1.5, display: 'block' }}
      >
        双视图编辑器
      </Typography>
      <ConfigurableTiptapEditor
        value={content}
        contentType="markdown"
        dualView
        compact
        className="editor-no-border"
        onChange={(next: string) => setContent(next)}
      />
    </Box>
  );
}
