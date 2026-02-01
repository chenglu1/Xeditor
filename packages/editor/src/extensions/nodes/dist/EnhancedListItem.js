"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.markdownItLazyListPlugin = exports.EnhancedListItem = void 0;
/*
 * 增强的列表项扩展
 * 支持2空格缩进的列表延续段落（解决链接无法解析的问题）
 */
var extension_list_item_1 = require("@tiptap/extension-list-item");
/**
 * 增强的列表项扩展
 *
 * 问题：后端返回的markdown中，列表延续段落使用2空格缩进，导致链接无法正确解析
 * 解决：自定义markdown解析规则，在序列化时将2空格缩进规范化为4空格
 *
 * 优势：
 * 1. 在Tiptap扩展层面解决，不需要预处理字符串
 * 2. 更符合框架设计，易于维护和扩展
 * 3. 性能更好，在AST层面操作
 */
exports.EnhancedListItem = extension_list_item_1.ListItem.extend({
    name: 'listItem',
    addStorage: function () {
        return {
            markdown: {
                // 自定义markdown序列化
                serialize: function (state, node) {
                    // 使用默认序列化
                    var defaultSerializer = state.serializer.nodes.list_item;
                    if (defaultSerializer) {
                        defaultSerializer(state, node);
                    }
                }
            }
        };
    },
    addOptions: function () {
        var _a;
        return __assign(__assign({}, (_a = this.parent) === null || _a === void 0 ? void 0 : _a.call(this)), { 
            // 支持更宽松的缩进规则
            HTMLAttributes: {}, nested: true });
    }
});
/**
 * 自定义markdown-it插件：支持2空格缩进的列表延续段落
 *
 * 这个插件会在markdown-it解析前预处理文本
 */
function markdownItLazyListPlugin(md) {
    // 保存原始的列表规则
    var originalListRule = md.block.ruler.__rules__.find(function (rule) { return rule.name === 'list'; });
    if (!originalListRule)
        return;
    var originalFn = originalListRule.fn;
    // 重写列表规则
    originalListRule.fn = function (state, startLine, endLine, silent) {
        // 预处理：将2空格缩进的延续段落转换为4空格
        var lines = state.src.split('\n');
        var inList = false;
        var modified = false;
        for (var i = startLine; i < endLine && i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();
            // 检测列表项
            if (/^[-*+]\s+|^\d+[.)]\s+/.test(trimmed)) {
                inList = true;
                continue;
            }
            // 在列表内
            if (inList) {
                // 空行
                if (trimmed === '') {
                    // 检查下一行是否是缩进内容
                    if (i + 1 < lines.length) {
                        var nextLine = lines[i + 1];
                        var nextTrimmed = nextLine.trim();
                        // 下一行是2-3空格缩进且不是新列表项
                        var match_1 = nextLine.match(/^( {2,3})(\S.*)$/);
                        if (match_1 &&
                            nextTrimmed &&
                            !/^[-*+]\s+|^\d+[.)]\s+/.test(nextTrimmed)) {
                            // 移除空行
                            lines.splice(i, 1);
                            i--;
                            modified = true;
                            continue;
                        }
                    }
                    inList = false;
                    continue;
                }
                // 处理2-3空格缩进
                var match = line.match(/^( {2,3})(\S.*)$/);
                if (match && !/^[-*+]\s+|^\d+[.)]\s+/.test(match[2])) {
                    // 转换为4空格缩进
                    lines[i] = '    ' + match[2];
                    modified = true;
                    continue;
                }
                // 没有缩进，列表结束
                if (trimmed && !line.match(/^ /)) {
                    inList = false;
                }
            }
        }
        // 如果修改了，更新state
        if (modified) {
            var oldSrc = state.src;
            state.src = lines.join('\n');
            var result = originalFn.call(this, state, startLine, endLine, silent);
            state.src = oldSrc; // 恢复原始文本
            return result;
        }
        // 调用原始规则
        return originalFn.call(this, state, startLine, endLine, silent);
    };
}
exports.markdownItLazyListPlugin = markdownItLazyListPlugin;
