import { Image } from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

interface ImageViewProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
    };
  };
}

const PreviewModal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const PreviewImage = styled.img<{ $scale: number; $rotate: number }>`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  cursor: move;
  user-select: none;
  transition: transform 0.3s ease;
  transform: scale(${(props) => props.$scale})
    rotate(${(props) => props.$rotate}deg);
`;

const Toolbar = styled.div`
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  z-index: 10000;
`;

const ToolButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
  color: #fff;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CloseButton = styled.button`
  position: fixed;
  right: 30px;
  top: 30px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
  transition: all 0.2s ease;
  color: #fff;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ZoomInfo = styled.div`
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  z-index: 10000;
  backdrop-filter: blur(10px);
`;

const ImageView: React.FC<ImageViewProps> = ({ node }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const { src, alt, title } = node.attrs;

  const handleImageClick = () => {
    setShowPreview(true);
    setScale(1);
    setRotate(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // 缩放
  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const newScale = prev + delta;
      return Math.max(0.1, Math.min(5, newScale));
    });
  };

  // 重置
  const handleReset = () => {
    setScale(1);
    setRotate(0);
    setPosition({ x: 0, y: 0 });
  };

  // 旋转
  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  // 全屏
  const handleFullscreen = () => {
    const modal = document.getElementById('tiptap-image-preview-modal');
    if (!modal) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      modal.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  };

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  }, []);

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 键盘快捷键
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!showPreview) return;

      switch (e.key) {
        case 'Escape':
          handleClosePreview();
          break;
        case '+':
        case '=':
          handleZoom(0.2);
          break;
        case '-':
          handleZoom(-0.2);
          break;
        case '0':
          handleReset();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    },
    [showPreview],
  );

  // 添加事件监听
  useEffect(() => {
    if (!showPreview) return;

    const imageElement = imageRef.current;
    if (imageElement) {
      imageElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    // 禁止页面滚动
    document.body.style.overflow = 'hidden';

    return () => {
      if (imageElement) {
        imageElement.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showPreview, handleWheel, handleMouseMove, handleMouseUp, handleKeyDown]);

  return (
    <NodeViewWrapper className="image-node-wrapper">
      <img
        src={src}
        alt={alt || ''}
        title={title || alt || ''}
        onClick={handleImageClick}
        style={{
          cursor: 'pointer',
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '8px',
        }}
      />
      {showPreview && (
        <PreviewModal
          id="tiptap-image-preview-modal"
          onClick={handleClosePreview}
        >
          <ImageContainer onClick={(e) => e.stopPropagation()}>
            <PreviewImage
              ref={imageRef}
              src={src}
              alt={alt || ''}
              $scale={scale}
              $rotate={rotate}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </ImageContainer>

          {/* 关闭按钮 */}
          <CloseButton onClick={handleClosePreview}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </CloseButton>

          {/* 缩放信息 */}
          <ZoomInfo>{Math.round(scale * 100)}%</ZoomInfo>

          {/* 工具栏 */}
          <Toolbar onClick={(e) => e.stopPropagation()}>
            <ToolButton onClick={() => handleZoom(0.2)} title="放大 (+)">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
              </svg>
            </ToolButton>

            <ToolButton onClick={() => handleZoom(-0.2)} title="缩小 (-)">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                <path d="M7 9h5v1H7z" />
              </svg>
            </ToolButton>

            <ToolButton onClick={handleReset} title="重置 (0)">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
            </ToolButton>

            <ToolButton onClick={handleRotate} title="旋转 (R)">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z" />
              </svg>
            </ToolButton>

            <ToolButton onClick={handleFullscreen} title="全屏">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </ToolButton>
          </Toolbar>
        </PreviewModal>
      )}
    </NodeViewWrapper>
  );
};

export const CustomImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
