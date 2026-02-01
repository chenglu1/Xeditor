/**
 * Tiptap 编辑器扩展
 *
 * 组织结构:
 * - nodes/     - 节点扩展 (图片、React 组件等)
 * - marks/     - 标记扩展 (下标、上标等)
 * - enhanced/  - 增强扩展 (Markdown、数学公式等)
 *
 * 主入口文件: createEditorExtensions.ts
 */

export { createEditorExtensions } from './createEditorExtensions';
export type { CreateEditorExtensionsOptions } from './createEditorExtensions';

// 重新导出各类扩展
export * from './nodes';
export * from './marks';
export { createEnhancedMarkdown } from './enhanced/EnhancedMarkdown';
export { OrderedListWithStart } from './enhanced/OrderedListWithStart';
export {
  EnhancedBlockMath,
  EnhancedInlineMath,
} from './enhanced/EnhancedMathematics';
export { TextAlignWithMarkdown } from './enhanced/TextAlignWithMarkdown';
