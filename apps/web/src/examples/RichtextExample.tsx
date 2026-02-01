import { useState } from 'react';
import { ConfigurableTiptapEditor } from '@xeditor/editor';
import { Box, Typography } from '@mui/material';

export function RichtextExample() {
  const [content, setContent] = useState(
    '# 页面标题\n\n在这里开始你的内容，例如产品介绍或活动说明。',
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
        富文本编辑器
      </Typography>
      <ConfigurableTiptapEditor
        value={content}
        contentType="markdown"
        compact
        className="editor-no-border"
        onChange={(next: string) => setContent(next)}
      />
    </Box>
  );
}
