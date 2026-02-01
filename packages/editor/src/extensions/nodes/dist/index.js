"use strict";
/**
 * 节点扩展 (Node Extensions)
 *
 * 包含自定义的 Tiptap 节点扩展:
 * - CustomImage: 带预览功能的图片节点
 * - CustomReactNode: 自定义 React 节点
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
var CustomImage_1 = require("./CustomImage");
__createBinding(exports, CustomImage_1, "CustomImage");
var CustomReactNode_1 = require("./CustomReactNode");
__createBinding(exports, CustomReactNode_1, "CustomReactNode");
