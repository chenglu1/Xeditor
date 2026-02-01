"use strict";
/**
 * 增强扩展 (Enhanced Extensions)
 *
 * 包含增强功能的扩展:
 * - EnhancedMarkdown: 增强的 Markdown 支持
 * - EnhancedMathematics: 增强的数学公式支持 (行内和块级)
 * - TextAlignWithMarkdown: 带 Markdown 支持的文本对齐（使用自定义语法）
 * - OrderedListWithStart: 支持起始编号的有序列表（使用原生 markdownTokenizer）
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
var EnhancedMarkdown_1 = require("./EnhancedMarkdown");
__createBinding(exports, EnhancedMarkdown_1, "createEnhancedMarkdown");
var OrderedListWithStart_1 = require("./OrderedListWithStart");
__createBinding(exports, OrderedListWithStart_1, "OrderedListWithStart");
var EnhancedMathematics_1 = require("./EnhancedMathematics");
__createBinding(exports, EnhancedMathematics_1, "EnhancedBlockMath");
__createBinding(exports, EnhancedMathematics_1, "EnhancedInlineMath");
var TextAlignWithMarkdown_1 = require("./TextAlignWithMarkdown");
__createBinding(exports, TextAlignWithMarkdown_1, "TextAlignWithMarkdown");
