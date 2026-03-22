import { useState, useEffect, useRef, useCallback } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { ConfigurableTiptapEditor } from '../components/LocalizedEditor';
import FULL_MARKDOWN from './streaming-demo.md?raw';

// ── 速度预设 ─────────────────────────────────────────────────
const SPEED_PRESETS = {
  slow: { label: '慢速', interval: 60, chunkSize: 2 },
  normal: { label: '中速', interval: 30, chunkSize: 4 },
  fast: { label: '快速', interval: 15, chunkSize: 8 },
} as const;

type SpeedKey = keyof typeof SPEED_PRESETS;

const USE_CASES = ['AI 对话实时渲染', '代码生成流式预览', 'LLM 文档写作输出'];

// ── 组件 ─────────────────────────────────────────────────────
export function StreamingPage() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<SpeedKey>('normal');
  const [progress, setProgress] = useState(0);

  const posRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  // 保持 pausedRef 与 isPaused 同步
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // ── 清理定时器 ───────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── 启动 / 重播 ─────────────────────────
  const startStreaming = useCallback(() => {
    clearTimer();
    posRef.current = 0;
    setContent('');
    setProgress(0);
    setIsStreaming(true);
    setIsPaused(false);

    const { interval, chunkSize } = SPEED_PRESETS[speed];

    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;

      const nextPos = Math.min(posRef.current + chunkSize, FULL_MARKDOWN.length);
      const nextContent = FULL_MARKDOWN.slice(0, nextPos);
      posRef.current = nextPos;
      setContent(nextContent);
      setProgress(Math.round((nextPos / FULL_MARKDOWN.length) * 100));

      if (nextPos >= FULL_MARKDOWN.length) {
        clearTimer();
        setIsStreaming(false);
      }
    }, interval);
  }, [speed, clearTimer]);

  // ── 暂停 / 继续 ─────────────────────────
  const togglePause = useCallback(() => {
    setIsPaused((v) => !v);
  }, []);

  // ── 停止 ─────────────────────────────────
  const stopStreaming = useCallback(() => {
    clearTimer();
    setIsStreaming(false);
    setIsPaused(false);
  }, [clearTimer]);

  // ── 速度切换（流式中也可生效） ──────────
  const handleSpeedChange = useCallback(
    (_: unknown, v: SpeedKey | null) => {
      if (!v) return;
      setSpeed(v);

      // 如果正在流式输出，重新创建定时器以应用新速度
      if (isStreaming && !isPaused) {
        clearTimer();
        const { interval, chunkSize } = SPEED_PRESETS[v];
        timerRef.current = setInterval(() => {
          if (pausedRef.current) return;
          const nextPos = Math.min(posRef.current + chunkSize, FULL_MARKDOWN.length);
          posRef.current = nextPos;
          setContent(FULL_MARKDOWN.slice(0, nextPos));
          setProgress(Math.round((nextPos / FULL_MARKDOWN.length) * 100));
          if (nextPos >= FULL_MARKDOWN.length) {
            clearTimer();
            setIsStreaming(false);
          }
        }, interval);
      }
    },
    [isStreaming, isPaused, clearTimer],
  );

  // 组件卸载时清理
  useEffect(() => clearTimer, [clearTimer]);

  const done = !isStreaming && progress === 100;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* ── 面包屑 ──────────────────────────── */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" underline="hover" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            首页
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
            流式输出模式
          </Typography>
        </Breadcrumbs>

        {/* ── 页头 ────────────────────────────── */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef9c3 100%)',
            border: '1px solid rgba(217,119,6,0.2)',
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
              background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              流式输出模式
            </Typography>
            <Chip
              label="AI 场景"
              size="small"
              sx={{
                bgcolor: 'rgba(217,119,6,0.1)',
                color: '#b45309',
                fontWeight: 700,
                border: '1px solid rgba(217,119,6,0.2)',
              }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, lineHeight: 1.7 }}>
            模拟 AI / LLM 逐 token 生成 Markdown 内容的场景。编辑器实时接收增量文本并即时渲染为富文本，
            展示流式写入过程中标题、列表、代码块、表格等各类元素的渲染效果。
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* ── 控制面板 ──────────────────────── */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid rgba(148,163,184,0.18)',
                boxShadow: '0 4px 24px -4px rgba(15,23,42,.07)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {/* 开始 / 重播 */}
                <Button
                  variant="contained"
                  size="small"
                  onClick={startStreaming}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' },
                  }}
                >
                  {done || progress > 0 ? '⟳ 重播' : '▶ 开始'}
                </Button>

                {/* 暂停 / 继续 */}
                {isStreaming && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={togglePause}
                    sx={{ borderRadius: 999, px: 2.5, minWidth: 80 }}
                  >
                    {isPaused ? '▶ 继续' : '⏸ 暂停'}
                  </Button>
                )}

                {/* 停止 */}
                {isStreaming && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={stopStreaming}
                    sx={{ borderRadius: 999, px: 2.5, minWidth: 80 }}
                  >
                    ⏹ 停止
                  </Button>
                )}

                {/* 速度选择 */}
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    速度
                  </Typography>
                  <ToggleButtonGroup
                    value={speed}
                    exclusive
                    onChange={handleSpeedChange}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        px: 1.5,
                        py: 0.3,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px !important',
                        textTransform: 'none',
                      },
                    }}
                  >
                    <ToggleButton value="slow">🐢 慢</ToggleButton>
                    <ToggleButton value="normal">🚀 中</ToggleButton>
                    <ToggleButton value="fast">⚡ 快</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {/* 进度条 */}
              {(isStreaming || done) && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {done ? '✅ 输出完成' : isPaused ? '⏸ 已暂停' : '⏳ 流式输出中...'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(217,119,6,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: done
                          ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                          : 'linear-gradient(90deg, #d97706, #f59e0b)',
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* ── 编辑器 ────────────────────────── */}
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
                  流式渲染预览
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isStreaming && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: isPaused ? '#f59e0b' : '#16a34a',
                        animation: isPaused ? 'none' : 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        },
                      }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {isStreaming ? (isPaused ? '已暂停' : '接收中...') : done ? '已完成' : '等待开始'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <ConfigurableTiptapEditor
                  value={content}
                  valueType="markdown"
                  presets={['base', 'formatting', 'table', 'math', 'markdownDialect']}
                  readOnly
                  showToolbar={false}
                />
              </Box>
            </Paper>
          </Grid>

          {/* ── 适用场景 ──────────────────────── */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(148,163,184,0.15)', bgcolor: '#fff' }}>
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
                      bgcolor: 'rgba(217,119,6,0.05)',
                      border: '1px solid rgba(217,119,6,0.2)',
                      color: '#b45309',
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
