import { createBlockMarkdownSpec, Node } from '@tiptap/core';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import React from 'react';

// Custom React component for demonstration
export const CustomReactComponent = ({
  node,
}: {
  node: { attrs: Record<string, unknown> };
}) => {
  return (
    <NodeViewWrapper className="custom-react-node">
      <div
        style={{
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          backgroundColor: '#eff6ff',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>
          Custom React Component
        </h4>
        <p style={{ margin: 0, color: '#374151' }}>
          {String(node.attrs.content || 'This is a custom React node view!')}
        </p>
        <div>
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

// Custom node extension with React node view
export const CustomReactNode = Node.create({
  name: 'customReactNode',

  group: 'block',

  content: 'block+',

  addAttributes() {
    return {
      content: {
        default: 'This is a custom React node view!',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-react-node"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'custom-react-node', ...HTMLAttributes }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomReactComponent);
  },

  markdownTokenName: 'customReactNode',

  ...createBlockMarkdownSpec({
    nodeName: 'customReactNode',
    name: 'react',
  }),
});
