"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.TextAlignWithMarkdown = void 0;
/*
 * @Description: 支持 Markdown 的文本对齐扩展
 * 使用自定义语法 :::{align=xxx} 在 Markdown 中保存对齐信息
 */
var core_1 = require("@tiptap/core");
var extension_text_align_1 = require("@tiptap/extension-text-align");
// 自定义语法的正则表达式
var ALIGN_SYNTAX_PATTERN = /:::\{align=(\w+)\}\n([\s\S]*?)\n:::/g;
/**
 * TextAlign 扩展 - 为 paragraph/heading 添加对齐支持
 *
 * 工作原理：
 * 1. Tiptap → MD: 拦截 serialize，在带对齐属性的段落周围包裹 :::{align=xxx}
 * 2. MD → Tiptap: 拦截 parse，将 :::{align=xxx} 转换为 <p style="text-align: xxx">
 */
exports.TextAlignWithMarkdown = core_1.Extension.create({
    name: 'textAlignMarkdown',
    addExtensions: function () {
        // 添加 TextAlign 扩展功能
        return [
            extension_text_align_1.TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left'
            }),
        ];
    },
    onBeforeCreate: function () {
        var _this = this;
        var markdownStorage = this.editor.storage.markdown;
        if (!(markdownStorage === null || markdownStorage === void 0 ? void 0 : markdownStorage.manager))
            return;
        var manager = markdownStorage.manager;
        // 1. 增强 parse: MD → Tiptap
        //    将自定义对齐语法转换为 HTML style 属性（在 EnhancedMarkdown 之后链式调用）
        var originalParse = manager.parse.bind(manager);
        manager.parse = function (markdown) {
            var processed = markdown.replace(ALIGN_SYNTAX_PATTERN, function (_, align, content) {
                var trimmedContent = content.trim();
                // 检测内容类型，保持原有结构
                if (trimmedContent.startsWith('#')) {
                    // 标题：提取标题级别和文本
                    var headingMatch = trimmedContent.match(/^(#{1,6})\s+(.*)$/);
                    if (headingMatch) {
                        var hashes = headingMatch[1], text = headingMatch[2];
                        var level = hashes.length;
                        return "<h" + level + " style=\"text-align: " + align + "\">" + text + "</h" + level + ">";
                    }
                }
                // 默认作为段落处理
                return "<p style=\"text-align: " + align + "\">" + trimmedContent + "</p>";
            });
            return originalParse(processed);
        };
        // 2. 增强 serialize: Tiptap → MD
        //    为带对齐属性的段落添加自定义语法包裹（在 EnhancedMarkdown 之前链式调用）
        var originalSerialize = manager.serialize.bind(manager);
        manager.serialize = function (docOrContent) {
            var markdown = originalSerialize(docOrContent);
            return _this.options.postProcessTextAlign(_this.editor.state.doc, markdown);
        };
    },
    addOptions: function () {
        return {
            /**
             * 后处理序列化的 markdown，添加对齐标记
             */
            postProcessTextAlign: function (doc, markdown) {
                if (!(doc === null || doc === void 0 ? void 0 : doc.content) || !markdown)
                    return markdown;
                var lines = markdown.split('\n');
                var alignments = [];
                var currentLineIndex = 0;
                // 遍历文档节点，找到带对齐属性的段落/标题
                doc.content.forEach(function (node) {
                    var _a, _b;
                    var nodeName = (_a = node.type) === null || _a === void 0 ? void 0 : _a.name;
                    var align = (_b = node.attrs) === null || _b === void 0 ? void 0 : _b.textAlign;
                    // 记录非默认对齐的段落位置
                    if ((nodeName === 'paragraph' || nodeName === 'heading') &&
                        align &&
                        align !== 'left') {
                        alignments.push({ lineIndex: currentLineIndex, align: align });
                    }
                    // 跳过空行，定位到下一个实际内容行
                    if (nodeName === 'paragraph' || nodeName === 'heading') {
                        currentLineIndex++;
                        while (currentLineIndex < lines.length &&
                            lines[currentLineIndex].trim() === '') {
                            currentLineIndex++;
                        }
                    }
                    else if (nodeName) {
                        currentLineIndex++;
                    }
                });
                if (alignments.length === 0)
                    return markdown;
                // 从后向前插入对齐标记（避免索引偏移）
                var result = __spreadArrays(lines);
                for (var i = alignments.length - 1; i >= 0; i--) {
                    var _a = alignments[i], lineIndex = _a.lineIndex, align = _a.align;
                    if (lineIndex < result.length && result[lineIndex].trim() !== '') {
                        result.splice(lineIndex, 0, ":::{align=" + align + "}");
                        result.splice(lineIndex + 2, 0, ":::");
                    }
                }
                return result.join('\n');
            }
        };
    }
});
