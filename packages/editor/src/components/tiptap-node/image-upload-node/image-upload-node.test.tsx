import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageUploadNode } from './image-upload-node';

vi.mock('../../../lib/tiptap-utils', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../../lib/tiptap-utils')
  >();

  return {
    ...actual,
    focusNextNode: vi.fn(),
    isValidPosition: (pos: number | null | undefined) =>
      typeof pos === 'number' && pos >= 0,
  };
});

vi.mock('@tiptap/react', () => ({
  NodeViewWrapper: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

function createNodeViewProps(options?: {
  accept?: string;
  upload?: (file: File) => Promise<unknown>;
  onError?: (error: Error) => void;
}) {
  const run = vi.fn();
  const insertContentAt = vi.fn(() => chain);
  const deleteRange = vi.fn(() => chain);
  const focus = vi.fn(() => chain);
  const chain = {
    focus,
    deleteRange,
    insertContentAt,
    run,
  };

  return {
    editor: {
      chain: () => chain,
    },
    extension: {
      options: {
        type: 'image',
        accept: options?.accept ?? 'image/*',
        limit: 3,
        maxSize: 5 * 1024 * 1024,
        upload: options?.upload,
        onError: options?.onError,
      },
    },
    getPos: () => 5,
    node: {
      attrs: {
        accept: options?.accept ?? 'image/*',
        limit: 3,
        maxSize: 5 * 1024 * 1024,
      },
      nodeSize: 1,
    },
    run,
    insertContentAt,
  } as any;
}

describe('ImageUploadNode', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps uploaded assets aligned with the original successful files', async () => {
    const onError = vi.fn();
    const props = createNodeViewProps({
      onError,
      upload: async (file: File) => {
        if (file.name === 'bad.png') {
          throw new Error('upload failed');
        }

        return {
          src: '/uploads/good.png',
        };
      },
    });
    const { container } = render(<ImageUploadNode {...props} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [
          new File(['bad'], 'bad.png', { type: 'image/png' }),
          new File(['good'], 'good.png', { type: 'image/png' }),
        ],
      },
    });

    await waitFor(() => {
      expect(props.insertContentAt).toHaveBeenCalledTimes(1);
    });

    const insertedNodes = props.insertContentAt.mock.calls[0][1];

    expect(insertedNodes).toEqual([
      {
        type: 'image',
        attrs: {
          src: '/uploads/good.png',
          alt: 'good',
          title: 'good',
        },
      },
    ]);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('rejects dropped files that do not match accept before uploading', async () => {
    const upload = vi.fn(async () => '/uploads/file.png');
    const onError = vi.fn();
    const props = createNodeViewProps({
      accept: 'image/png',
      onError,
      upload,
    });
    const { container } = render(<ImageUploadNode {...props} />);
    const dropArea = container.querySelector(
      '.tiptap-image-upload-drag-area',
    ) as HTMLElement;

    fireEvent.drop(dropArea, {
      dataTransfer: {
        files: [new File(['notes'], 'notes.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });

    expect(String(onError.mock.calls[0][0].message)).toContain(
      'File type not accepted',
    );
    expect(upload).not.toHaveBeenCalled();
    expect(props.insertContentAt).not.toHaveBeenCalled();
  });
});
