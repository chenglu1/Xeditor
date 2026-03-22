// @vitest-environment node

import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ConfigurableTiptapEditor from './ConfigurableTiptapEditor';

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

describe('ConfigurableTiptapEditor SSR', () => {
  beforeEach(() => {
    mockUseConfigurableEditor.mockReset();
  });

  it('renders the static viewer branch on the server for read-only content', () => {
    const html = renderToStaticMarkup(
      <ConfigurableTiptapEditor
        value="# read only"
        valueType="markdown"
        readOnly={true}
      />,
    );

    expect(html).toContain('data-testid="static-view"');
    expect(mockUseConfigurableEditor).not.toHaveBeenCalled();
  });

  it('renders a loading fallback on the server for editable content without initializing the editor', () => {
    const html = renderToStaticMarkup(
      <ConfigurableTiptapEditor
        value="# editable"
        valueType="markdown"
        messages={{ loading: 'SSR loading' }}
      />,
    );

    expect(html).toContain('SSR loading');
    expect(mockUseConfigurableEditor).not.toHaveBeenCalled();
  });
});
