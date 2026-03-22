import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ConfigurableTiptapEditor from './ConfigurableTiptapEditor';
import type { ToolbarConfig } from './types';

const mockUseConfigurableEditor = vi.fn();

vi.mock('./core/useConfigurableEditor', () => ({
  useConfigurableEditor: (props: unknown) => mockUseConfigurableEditor(props),
}));

vi.mock('./components/SingleViewEditor', () => ({
  SingleViewEditor: () => <div data-testid="single-view" />,
}));

vi.mock('./components/DualViewEditor', () => ({
  DualViewEditor: () => <div data-testid="dual-view" />,
}));

vi.mock('./views/ReadOnlyContentViewer', () => ({
  ReadOnlyContentViewer: () => <div data-testid="read-only-view" />,
}));

vi.mock('./views/StaticContentViewer', () => ({
  StaticContentViewer: () => <div data-testid="static-view" />,
}));

const toolbarConfig: ToolbarConfig = {
  showUndoRedo: false,
  showStructure: false,
  showFormatting: false,
  showScript: false,
  showAlign: false,
  showImage: false,
  supportedToolbarButtons: [],
  toolbarSchema: [],
  shouldShowButton: () => false,
};

describe('ConfigurableTiptapEditor', () => {
  beforeEach(() => {
    mockUseConfigurableEditor.mockReset();
    mockUseConfigurableEditor.mockReturnValue({
      activeMode: 'richtext',
      editor: {} as any,
      isDualViewEnabled: true,
      isMobile: false,
      markdownValue: '# draft',
      onMarkdownChange: vi.fn(),
      onSwitchToMarkdown: vi.fn(),
      onSwitchToRichtext: vi.fn(),
      toolbarConfig,
    });
  });

  it('routes read-only rendering through the dedicated viewer branch', () => {
    render(
      <ConfigurableTiptapEditor
        value="# draft"
        contentType="markdown"
        readOnly={true}
        dualView={true}
      />,
    );

    expect(screen.getByTestId('read-only-view')).not.toBeNull();
    expect(screen.queryByTestId('dual-view')).toBeNull();
    expect(screen.queryByTestId('single-view')).toBeNull();
  });

  it('routes read-only static viewer mode through the lightweight viewer branch', () => {
    render(
      <ConfigurableTiptapEditor
        value="# draft"
        contentType="markdown"
        readOnly={true}
        viewerMode="static"
      />,
    );

    expect(screen.getByTestId('static-view')).not.toBeNull();
    expect(mockUseConfigurableEditor).not.toHaveBeenCalled();
  });
});
