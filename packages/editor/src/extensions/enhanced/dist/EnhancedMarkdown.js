"use strict";
exports.__esModule = true;
exports.createEnhancedMarkdown = void 0;
/*
 * 增强的 Markdown 扩展
 * 功能：表格空行处理、列表缩进规范化、链接格式修复
 */
var markdown_1 = require("@tiptap/markdown");
// 常量定义
var LIST_ITEM_PATTERN = /^[-*+]\s+|^\d+[.)]\s+/;
var INDENT_PATTERN = /^( {2,})(\S.*)$/;
var STANDARD_INDENT = '    ';
var STANDARD_INDENT_SPACES = 4;
/**
 * 创建增强的 Markdown 扩展
 */
exports.createEnhancedMarkdown = function (options) {
    return markdown_1.Markdown.extend({
        onBeforeCreate: function () {
            if (this.parent) {
                this.parent({ editor: this.editor });
            }
            var storage = this.editor.storage.markdown;
            if (!storage)
                return;
            var parser = storage.parser;
            if (parser) {
                configureMarkdownIt(parser);
            }
            var manager = storage.manager;
            if (!manager)
                return;
            // 增强 parse：预处理表格和列表格式
            var originalParse = manager.parse.bind(manager);
            manager.parse = function (markdown) {
                try {
                    var processed = preprocessMarkdown(markdown);
                    return originalParse(processed);
                }
                catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Markdown parse error:', error);
                    return originalParse(markdown);
                }
            };
            // 增强 serialize：后处理链接格式
            var originalSerialize = manager.serialize.bind(manager);
            manager.serialize = function (docOrContent) {
                try {
                    var markdown = originalSerialize(docOrContent);
                    return postProcessMarkdown(markdown);
                }
                catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Markdown serialize error:', error);
                    return originalSerialize(docOrContent);
                }
            };
        }
    }).configure(options || {});
};
// 辅助函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function configureMarkdownIt(markdownIt) {
    if (!markdownIt)
        return;
    markdownIt.set({
        html: true,
        breaks: false,
        linkify: true,
        typographer: false
    });
    if (markdownIt.enable) {
        try {
            markdownIt.enable(['table']);
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Table plugin not available:', e);
        }
    }
}
/**
 * 预处理 Markdown 内容：处理表格、列表格式
 */
function preprocessMarkdown(markdown) {
    if (!markdown || typeof markdown !== 'string')
        return markdown || '';
    var processed = preprocessHtmlTables(markdown);
    processed = preprocessTableSpaces(processed);
    processed = normalizeListIndentation(processed);
    return processed;
}
/**
 * 处理 HTML 表格：确保表格前后有空行，避免影响后续 Markdown 解析
 */
function preprocessHtmlTables(markdown) {
    if (!markdown || typeof markdown !== 'string')
        return markdown || '';
    // 匹配 <table>...</table> 标签，在前后添加空行确保独立的 HTML 块
    var processed = markdown.replace(/(<table[\s\S]*?<\/table>)/gi, function (match) {
        return "\n\n" + match + "\n\n";
    });
    // 清理多余的连续空行（超过2个）
    processed = processed.replace(/\n{3,}/g, '\n\n');
    return processed;
}
/**
 * 移除表格行之间的空行（GFM表格要求行连续）
 */
function preprocessTableSpaces(markdown) {
    if (!markdown || typeof markdown !== 'string')
        return markdown || '';
    var lines = markdown.split('\n');
    var result = [];
    var i = 0;
    while (i < lines.length) {
        var line = lines[i];
        var trimmed = line.trim();
        // 检测表格开始（|开头结尾）
        if (trimmed && trimmed.startsWith('|') && trimmed.endsWith('|')) {
            var tableLines = [];
            // 收集表格行（跳过中间空行）
            while (i < lines.length) {
                var currentLine = lines[i];
                var currentTrimmed = currentLine.trim();
                if (currentTrimmed === '') {
                    // 空行：前瞻检查后续是否还有表格行
                    var hasMoreTableLines = false;
                    for (var j = i + 1; j < lines.length; j++) {
                        var futureLineTrimmed = lines[j].trim();
                        if (futureLineTrimmed === '')
                            continue;
                        if (futureLineTrimmed.startsWith('|') &&
                            futureLineTrimmed.endsWith('|')) {
                            hasMoreTableLines = true;
                        }
                        break;
                    }
                    if (hasMoreTableLines) {
                        i++;
                        continue;
                    }
                    else {
                        break;
                    }
                }
                else if (currentTrimmed.startsWith('|') &&
                    currentTrimmed.endsWith('|')) {
                    tableLines.push(currentLine);
                    i++;
                }
                else {
                    break;
                }
            }
            // 输出表格（前后加空行）
            if (tableLines.length > 0) {
                if (result.length > 0 && result[result.length - 1].trim() !== '') {
                    result.push('');
                }
                result.push.apply(result, tableLines);
                if (i < lines.length && lines[i].trim() !== '') {
                    result.push('');
                }
            }
        }
        else {
            result.push(line);
            i++;
        }
    }
    return result.join('\n');
}
/**
 * 规范化列表缩进（2空格→4空格，移除列表项内空行）
 */
function normalizeListIndentation(markdown) {
    if (!markdown || typeof markdown !== 'string')
        return markdown || '';
    var lines = markdown.split('\n');
    var result = [];
    var inListItem = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();
        // 检测列表项开始
        if (LIST_ITEM_PATTERN.test(trimmed)) {
            inListItem = true;
            result.push(line);
            continue;
        }
        if (inListItem) {
            // 处理空行
            if (trimmed === '') {
                if (isListContinuation(lines, i)) {
                    continue; // 跳过列表项内空行
                }
                result.push(line);
                inListItem = false;
                continue;
            }
            // 处理缩进内容
            var indentMatch = line.match(INDENT_PATTERN);
            if (indentMatch) {
                var indent = indentMatch[1], content = indentMatch[2];
                if (!LIST_ITEM_PATTERN.test(content)) {
                    // 标准化缩进为4空格
                    result.push(indent.length < STANDARD_INDENT_SPACES
                        ? STANDARD_INDENT + content
                        : line);
                    continue;
                }
            }
            if (trimmed) {
                inListItem = false;
            }
        }
        result.push(line);
    }
    return result.join('\n');
}
/**
 * 检查是否为列表项的连续内容
 */
function isListContinuation(lines, currentIndex) {
    if (currentIndex + 1 >= lines.length)
        return false;
    var nextLine = lines[currentIndex + 1];
    var nextTrimmed = nextLine.trim();
    return (nextLine.match(INDENT_PATTERN) !== null &&
        nextTrimmed.length > 0 &&
        !LIST_ITEM_PATTERN.test(nextTrimmed));
}
/**
 * 修复链接格式：`[text](url)` → [`text`](url)
 */
function postProcessMarkdown(markdown) {
    if (!markdown || typeof markdown !== 'string')
        return markdown || '';
    return markdown
        .replace(/`\[([^\]]+)\]\(([^)]+)\)`/g, function (_, text, url) { return "[`" + text + "`](" + url + ")"; })
        .replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, function (_, text, url) { return "[**" + text + "**](" + url + ")"; })
        .replace(/(?<!\*)\*\[([^\]]+)\]\(([^)]+)\)\*(?!\*)/g, function (_, text, url) { return "[*" + text + "*](" + url + ")"; });
}
