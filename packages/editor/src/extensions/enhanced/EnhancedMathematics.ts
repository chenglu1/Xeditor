/**
 * 增强的数学公式扩展
 *
 * 功能：
 * 1. 自动修复 LaTeX 语法中的空格问题（如 y _ {j} → y_{j}）
 * 2. BlockMath 支持 displayMode: true，支持 \tag 命令
 * 3. InlineMath 使用 displayMode: false，保持行内样式
 * 4. 在渲染层修复，不改变原始数据
 */
import { BlockMath, InlineMath } from '@tiptap/extension-mathematics';
import type { KatexOptions } from 'katex';
import katex from 'katex';

/**
 * 规范化 LaTeX 语法，移除不必要的空格
 */
export function normalizeLatexSyntax(latex: string): string {
  if (!latex || typeof latex !== 'string') return latex;

  return latex
    .replace(/([_^])\s+\{/g, '$1{')
    .replace(
      /\\(tag|left|right|sum|int|prod|frac|sqrt|lim|log|ln|sin|cos|tan)\s+([{([\]])/g,
      '\\$1$2',
    )
    .replace(/([)[\]])\s+\{/g, '$1{')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * 增强的 BlockMath 扩展
 * 在渲染时自动修复 LaTeX 语法问题
 */
export const EnhancedBlockMath = BlockMath.extend({
  addNodeView() {
    return ({ node, getPos }) => {
      const wrapper = document.createElement('div');
      const innerWrapper = document.createElement('div');
      wrapper.className = 'tiptap-mathematics-render';

      if (this.editor.isEditable) {
        wrapper.classList.add('tiptap-mathematics-render--editable');
      }

      innerWrapper.className = 'block-math-inner';
      wrapper.dataset.type = 'block-math';
      wrapper.setAttribute('data-latex', node.attrs.latex);
      wrapper.appendChild(innerWrapper);

      const renderMath = () => {
        try {
          // 自动规范化 LaTeX 语法
          const normalizedLatex = normalizeLatexSyntax(node.attrs.latex);

          const options: KatexOptions = {
            ...this.options.katexOptions,
            displayMode: true, // 确保 display mode
          };

          katex.render(normalizedLatex, innerWrapper, options);
          wrapper.classList.remove('block-math-error');
        } catch (error) {
          // 渲染失败时显示原始文本
          wrapper.textContent = node.attrs.latex;
          wrapper.classList.add('block-math-error');
          console.warn('LaTeX render error:', error);
        }
      };

      const handleClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const pos = getPos();

        if (pos != null && this.options.onClick) {
          this.options.onClick(node, pos);
        }
      };

      // 保存 onClick 引用，以便在 destroy 中使用
      const hasClickHandler = !!this.options.onClick;

      if (hasClickHandler) {
        wrapper.addEventListener('click', handleClick);
      }

      renderMath();

      return {
        dom: wrapper,
        destroy() {
          if (hasClickHandler) {
            wrapper.removeEventListener('click', handleClick);
          }
        },
      };
    };
  },
});

/**
 * 增强的 InlineMath 扩展
 * 在渲染时自动修复 LaTeX 语法问题
 */
export const EnhancedInlineMath = InlineMath.extend({
  addNodeView() {
    return ({ node, getPos }) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'tiptap-mathematics-render';

      if (this.editor.isEditable) {
        wrapper.classList.add('tiptap-mathematics-render--editable');
      }

      wrapper.dataset.type = 'inline-math';
      wrapper.setAttribute('data-latex', node.attrs.latex);

      const renderMath = () => {
        try {
          // 自动规范化 LaTeX 语法
          const normalizedLatex = normalizeLatexSyntax(node.attrs.latex);

          const options: KatexOptions = {
            ...this.options.katexOptions,
            displayMode: false, // 确保 inline mode
          };

          katex.render(normalizedLatex, wrapper, options);
          wrapper.classList.remove('inline-math-error');
        } catch (error) {
          // 渲染失败时显示原始文本
          wrapper.textContent = node.attrs.latex;
          wrapper.classList.add('inline-math-error');
          console.warn('LaTeX render error:', error);
        }
      };

      const handleClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const pos = getPos();

        if (pos != null && this.options.onClick) {
          this.options.onClick(node, pos);
        }
      };

      // 保存 onClick 引用，以便在 destroy 中使用
      const hasClickHandler = !!this.options.onClick;

      if (hasClickHandler) {
        wrapper.addEventListener('click', handleClick);
      }

      renderMath();

      return {
        dom: wrapper,
        destroy() {
          if (hasClickHandler) {
            wrapper.removeEventListener('click', handleClick);
          }
        },
      };
    };
  },
});
