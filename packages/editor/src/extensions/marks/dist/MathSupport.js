"use strict";
/**
 * 为 Mathematics 扩展添加 Markdown 支持
 *
 * @tiptap/extension-mathematics 默认不包含 Markdown 解析，
 * 需要手动配置如何将 $...$ 和 $$...$$ 转换为节点
 */
exports.__esModule = true;
exports.MathMarkdownSupport = void 0;
var core_1 = require("@tiptap/core");
exports.MathMarkdownSupport = core_1.Extension.create({
    name: 'mathMarkdownSupport',
    addStorage: function () {
        return {
            markdown: {
                parser: {
                    // 配置 InlineMath 的 Markdown 解析
                    inlineMath: {
                        match: /\$([^\$\n]+?)\$/,
                        node: 'inlineMath'
                    },
                    // 配置 BlockMath 的 Markdown 解析
                    blockMath: {
                        match: /\$\$\n?([\s\S]+?)\n?\$\$/,
                        node: 'blockMath'
                    }
                }
            }
        };
    },
    onBeforeCreate: function () {
        var _this = this;
        var editor = this.editor;
        // 等待所有扩展加载完成后配置
        setTimeout(function () {
            var storage = editor.storage.markdown;
            if (!storage || !storage.manager)
                return;
            var manager = storage.manager;
            // 保存原始的 parse 方法
            var originalParse = manager.parse.bind(manager);
            // 重写 parse 方法，预处理数学公式
            manager.parse = function (markdown) {
                // 先处理数学公式，转换为特殊标记
                var processed = markdown;
                // 处理块级公式 $$...$$
                processed = processed.replace(/\$\$\n?([\s\S]+?)\n?\$\$/g, function (match, latex) {
                    // 返回一个特殊的 code block 标记，稍后会被转换
                    return "```math-block\n" + latex.trim() + "\n```";
                });
                // 处理行内公式 $...$（但不匹配 $$）
                processed = processed.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, function (match, latex) {
                    // 返回一个特殊的 code 标记
                    return "`math-inline:" + latex + "`";
                });
                // 调用原始 parse
                var doc = originalParse(processed);
                // 后处理：将特殊标记转换为数学节点
                if (doc && doc.content) {
                    doc.content.forEach(function (node, index) {
                        _this.processMathNodes(node);
                    });
                }
                return doc;
            };
        }, 0);
    },
    processMathNodes: function (node) {
        var _this = this;
        var _a, _b, _c;
        if (!node)
            return;
        // 处理 code block 中的 math-block
        if (((_a = node.type) === null || _a === void 0 ? void 0 : _a.name) === 'codeBlock' && ((_b = node.attrs) === null || _b === void 0 ? void 0 : _b.language) === 'math-block') {
            node.type = this.editor.schema.nodes.blockMath;
            node.attrs = { latex: node.textContent || '' };
            delete node.content;
        }
        // 处理 code 中的 math-inline
        if (((_c = node.type) === null || _c === void 0 ? void 0 : _c.name) === 'code') {
            var text = node.textContent || '';
            if (text.startsWith('math-inline:')) {
                var latex = text.substring('math-inline:'.length);
                node.type = this.editor.schema.nodes.inlineMath;
                node.attrs = { latex: latex };
                delete node.content;
            }
        }
        // 递归处理子节点
        if (node.content) {
            node.content.forEach(function (child) { return _this.processMathNodes(child); });
        }
    }
});
