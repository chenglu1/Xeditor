import { useRef, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  ConfigurableTiptapEditor,
  type EditorUpdateEvent,
  type UploadedAsset,
} from '@chenglu1/xeditor-editor';

const JSON_INITIAL_DOC = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'JSON Mode' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This editor is controlled with structured Tiptap JSON.',
        },
      ],
    },
  ],
};

const TOOLBAR_INITIAL_MARKDOWN = `## Schema Driven Toolbar

Use a minimal toolbar and inject custom actions from outside.
`;

const VIEWER_INITIAL_MARKDOWN = `:::{align=center}
## Static Viewer Preview
:::

3. Ordered list start is preserved
4. Viewer can switch between static and editor-shell mode
`;

const UPLOAD_INITIAL_MARKDOWN = `## Media Upload Hooks

Use the toolbar image button to insert a local image with a structured asset result.
`;

const CUSTOM_MESSAGES = {
  loading: 'Loading generalized editor...',
  modeRichText: 'Rich Text',
  modeMarkdown: 'Markdown',
  uploadClickOrDrop: 'Upload an image or drag it here',
  uploadLimit: ({
    limit,
    maxSizeMB,
  }: {
    limit: number;
    maxSizeMB: number;
  }) => `Up to ${limit} files, ${maxSizeMB}MB each.`,
  uploadInProgress: ({ count }: { count: number }) =>
    `Uploading ${count} file${count === 1 ? '' : 's'}`,
  clearAllUploads: 'Clear queue',
};

function formatUpdateSummary(event: EditorUpdateEvent | null) {
  if (!event) {
    return 'No update yet.';
  }

  return [
    `source: ${event.source}`,
    `valueType: ${event.valueType}`,
    `characterCount: ${event.characterCount}`,
    `wordCount: ${event.wordCount ?? 0}`,
  ].join('\n');
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read file'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function CodePanel(props: { title: string; value: string }) {
  const { title, value } = props;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid rgba(148,163,184,0.15)',
        bgcolor: '#0f172a',
        color: '#cbd5e1',
        height: '100%',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ color: '#f8fafc', fontWeight: 700, mb: 1.5 }}
      >
        {title}
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: '0.78rem',
          lineHeight: 1.7,
          fontFamily: '"JetBrains Mono", Consolas, monospace',
        }}
      >
        {value}
      </Box>
    </Paper>
  );
}

export function GeneralizationPage() {
  const [jsonDoc, setJsonDoc] = useState<any>(JSON_INITIAL_DOC);
  const [lastUpdate, setLastUpdate] = useState<EditorUpdateEvent | null>(null);
  const [toolbarContent, setToolbarContent] = useState(TOOLBAR_INITIAL_MARKDOWN);
  const [viewerContent, setViewerContent] = useState(VIEWER_INITIAL_MARKDOWN);
  const [viewerMode, setViewerMode] = useState<'static' | 'editor-shell'>(
    'static',
  );
  const [uploadContent, setUploadContent] = useState(UPLOAD_INITIAL_MARKDOWN);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);
  const jsonEditorRef = useRef<any>(null);

  const appendUploadLog = (message: string) => {
    setUploadLogs((current) => [
      `${new Date().toLocaleTimeString()}  ${message}`,
      ...current,
    ].slice(0, 8));
  };

  const handleJsonUpdate = (event: EditorUpdateEvent) => {
    setLastUpdate(event);

    if (event.valueType === 'json') {
      setJsonDoc(event.value);
    }
  };

  const handleToolbarUpdate = (event: EditorUpdateEvent) => {
    if (event.valueType === 'markdown') {
      setToolbarContent(event.value as string);
    }
  };

  const handleViewerUpdate = (event: EditorUpdateEvent) => {
    if (event.valueType === 'markdown') {
      setViewerContent(event.value as string);
    }
  };

  const handleUploadUpdate = (event: EditorUpdateEvent) => {
    if (event.valueType === 'markdown') {
      setUploadContent(event.value as string);
    }
  };

  const insertTimestamp = () => {
    setToolbarContent((current) => {
      return `${current}\n> inserted at ${new Date().toLocaleString()}\n`;
    });
  };

  const handleUpload = async (file: File): Promise<UploadedAsset> => {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    const src = await readFileAsDataUrl(file);

    return {
      src,
      alt: file.name,
      title: file.name,
      mimeType: file.type,
      meta: {
        size: file.size,
        source: 'demo',
      },
    };
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: '0.85rem' }}
          >
            Home
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontSize: '0.85rem', fontWeight: 600 }}
          >
            Generalized API
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background:
              'linear-gradient(135deg, #fff7ed 0%, #fffbeb 45%, #f8fafc 100%)',
            border: '1px solid rgba(249,115,22,0.18)',
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {[
              'valueType',
              'onUpdate',
              'viewerMode',
              'toolbarSchema',
              'messages',
              'mediaUpload',
            ].map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                sx={{
                  bgcolor: 'rgba(249,115,22,0.1)',
                  color: '#c2410c',
                  border: '1px solid rgba(249,115,22,0.2)',
                  fontWeight: 700,
                }}
              />
            ))}
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
            Generalized API Examples
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 760, lineHeight: 1.75 }}
          >
            This page demonstrates the new editor usage patterns added during the
            generalization phase: structured values, schema-driven toolbar
            composition, lightweight static viewers, and structured media upload
            hooks.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(148,163,184,0.18)',
                bgcolor: '#fff',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                1. JSON value + onUpdate + editorRef
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Control the editor with Tiptap JSON and read structured update
                events without converting back to markdown strings.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <ConfigurableTiptapEditor
                    value={jsonDoc}
                    valueType="json"
                    editorRef={jsonEditorRef}
                    onUpdate={handleJsonUpdate}
                    minHeight="260px"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <CodePanel
                    title={`editorRef attached: ${jsonEditorRef.current ? 'yes' : 'no'}`}
                    value={`${formatUpdateSummary(lastUpdate)}\n\n${JSON.stringify(jsonDoc, null, 2)}`}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(148,163,184,0.18)',
                bgcolor: '#fff',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                2. toolbarSchema + supportedToolbarButtons + renderToolbarItem
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Keep only the built-ins you want, define the group order
                explicitly, and inject a custom toolbar action from outside.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <ConfigurableTiptapEditor
                    value={toolbarContent}
                    valueType="markdown"
                    presets={['base', 'formatting', 'markdownDialect']}
                    supportedToolbarButtons={[
                      'undo',
                      'redo',
                      'bold',
                      'italic',
                      'link',
                    ]}
                    toolbarSchema={[
                      ['undo', 'redo'],
                      ['bold', 'italic', 'link'],
                      [{ type: 'custom', id: 'insert-timestamp' }],
                    ]}
                    renderToolbarItem={({ item }) => {
                      if (
                        typeof item !== 'string' &&
                        item.id === 'insert-timestamp'
                      ) {
                        return (
                          <button
                            type="button"
                            onClick={insertTimestamp}
                            style={{
                              border: '1px solid rgba(124,58,237,0.22)',
                              background: 'rgba(124,58,237,0.08)',
                              color: '#6d28d9',
                              borderRadius: 8,
                              padding: '6px 10px',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Insert Timestamp
                          </button>
                        );
                      }

                      return null;
                    }}
                    onUpdate={handleToolbarUpdate}
                    minHeight="240px"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CodePanel title="Markdown Output" value={toolbarContent} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(148,163,184,0.18)',
                bgcolor: '#fff',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                3. viewerMode + markdownDialect
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use a regular editor for authoring, then switch the read-only
                preview between the lightweight static renderer and the editor
                shell viewer.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  size="small"
                  variant={viewerMode === 'static' ? 'contained' : 'outlined'}
                  onClick={() => setViewerMode('static')}
                >
                  Static Viewer
                </Button>
                <Button
                  size="small"
                  variant={
                    viewerMode === 'editor-shell' ? 'contained' : 'outlined'
                  }
                  onClick={() => setViewerMode('editor-shell')}
                >
                  Editor Shell
                </Button>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <ConfigurableTiptapEditor
                    value={viewerContent}
                    valueType="markdown"
                    onUpdate={handleViewerUpdate}
                    minHeight="240px"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ConfigurableTiptapEditor
                    value={viewerContent}
                    valueType="markdown"
                    readOnly
                    showToolbar={false}
                    viewerMode={viewerMode}
                    markdownDialect={{
                      normalizeListIndentation: true,
                      normalizeTables: true,
                      preserveOrderedListStart: true,
                      textAlignSyntax: 'directive',
                    }}
                    minHeight="240px"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(148,163,184,0.18)',
                bgcolor: '#fff',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                4. Structured uploadHandler + mediaUpload + messages
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Return a structured asset, validate files before upload, and
                observe upload lifecycle events without coupling the editor to a
                business-specific backend.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <ConfigurableTiptapEditor
                    value={uploadContent}
                    valueType="markdown"
                    messages={CUSTOM_MESSAGES}
                    uploadHandler={handleUpload}
                    mediaUpload={{
                      validateFile: (file) => {
                        if (!file.type.startsWith('image/')) {
                          return new Error('Images only in this demo');
                        }

                        if (file.size > 1024 * 1024) {
                          return new Error('Please keep images under 1MB');
                        }

                        return null;
                      },
                      onUploadStart: (file) => {
                        appendUploadLog(`start ${file.name}`);
                      },
                      onUploadProgress: (file, progress) => {
                        appendUploadLog(`${file.name} ${progress}%`);
                      },
                      onUploadSuccess: (file, asset) => {
                        appendUploadLog(`done ${file.name} -> ${asset.mimeType}`);
                      },
                      onUploadError: (file, error) => {
                        appendUploadLog(`error ${file.name} -> ${error.message}`);
                      },
                    }}
                    onUpdate={handleUploadUpdate}
                    minHeight="240px"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CodePanel
                    title="Upload Event Log"
                    value={uploadLogs.length > 0 ? uploadLogs.join('\n') : 'No uploads yet.'}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
