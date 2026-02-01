"use strict";
/**
 * 标记扩展 (Mark Extensions)
 *
 * 包含文本格式化的标记扩展:
 * - CustomStrike: 删除线（严格匹配 ~~）
 * - Subscript: 下标
 * - Superscript: 上标
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
var CustomStrike_1 = require("./CustomStrike");
__createBinding(exports, CustomStrike_1, "CustomStrike");
var Subscript_1 = require("./Subscript");
__createBinding(exports, Subscript_1, "Subscript");
var Superscript_1 = require("./Superscript");
__createBinding(exports, Superscript_1, "Superscript");
