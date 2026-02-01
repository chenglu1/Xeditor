"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.OrderedListWithStart = void 0;
/*
 * @Description: 支持起始编号的有序列表扩展
 * 通过拦截 Markdown manager 的 serialize 方法来保留列表起始编号
 */
var core_1 = require("@tiptap/core");
var extension_ordered_list_1 = require("@tiptap/extension-ordered-list");
/**
 * 增强的 OrderedList 扩展
 * 使用 onBeforeCreate 钩子拦截序列化，保留列表起始编号
 */
exports.OrderedListWithStart = core_1.Extension.create({
    name: 'orderedListWithStart',
    addExtensions: function () {
        // 添加标准的 OrderedList 功能
        return [extension_ordered_list_1.OrderedList];
    },
    onBeforeCreate: function () {
        var _this = this;
        var markdownStorage = this.editor.storage.markdown;
        if (!(markdownStorage === null || markdownStorage === void 0 ? void 0 : markdownStorage.manager)) {
            return;
        }
        var manager = markdownStorage.manager;
        // 拦截 serialize 方法，在序列化后修复列表起始编号
        var originalSerialize = manager.serialize.bind(manager);
        manager.serialize = function (docOrContent) {
            var markdown = originalSerialize(docOrContent);
            return fixOrderedListStart(markdown, _this.editor.state.doc);
        };
    }
});
/**
 * 修复有序列表的起始编号
 * 策略：从文档树获取真实的 start 值，映射到 Markdown 的列表段
 */
function fixOrderedListStart(markdown, doc) {
    if (!markdown || !doc)
        return markdown;
    // 收集所有 orderedList 的 start 信息（这是真实的起始编号）
    var listStarts = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.content.forEach(function (node) {
        var _a, _b;
        if (((_a = node.type) === null || _a === void 0 ? void 0 : _a.name) === 'orderedList') {
            listStarts.push(((_b = node.attrs) === null || _b === void 0 ? void 0 : _b.start) || 1);
        }
    });
    // 如果没有 start>1 的列表，不需要处理
    if (listStarts.length === 0 || !listStarts.some(function (start) { return start > 1; })) {
        return markdown;
    }
    var lines = markdown.split('\n');
    var result = __spreadArrays(lines);
    // 识别 Markdown 中的列表段（序列化后都是从1开始的连续编号）
    var listSegments = [];
    var segmentStartLine = -1;
    var currentListIndex = 0;
    var consecutiveNonListLines = 0;
    for (var i = 0; i < lines.length; i++) {
        var listItemMatch = lines[i].match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (listItemMatch) {
            var currentNumber = parseInt(listItemMatch[2], 10);
            if (segmentStartLine === -1) {
                // 新列表段开始
                segmentStartLine = i;
            }
            else if (currentNumber === 1) {
                // 编号重置为1，说明是新的列表段
                listSegments.push({
                    startLine: segmentStartLine,
                    endLine: i - 1,
                    listIndex: currentListIndex
                });
                currentListIndex++;
                segmentStartLine = i;
            }
            consecutiveNonListLines = 0;
        }
        else if (segmentStartLine !== -1) {
            // 在列表段中遇到非列表行
            consecutiveNonListLines++;
            // 连续2行非空非列表行，认为列表段结束
            if (consecutiveNonListLines >= 2 && lines[i].trim() !== '') {
                listSegments.push({
                    startLine: segmentStartLine,
                    endLine: i - consecutiveNonListLines,
                    listIndex: currentListIndex
                });
                currentListIndex++;
                segmentStartLine = -1;
            }
        }
    }
    // 保存最后一段
    if (segmentStartLine !== -1) {
        listSegments.push({
            startLine: segmentStartLine,
            endLine: lines.length - 1,
            listIndex: currentListIndex
        });
    }
    // 修复列表段，使用文档树中的真实 start 值
    listSegments.forEach(function (_a) {
        var startLine = _a.startLine, endLine = _a.endLine, listIndex = _a.listIndex;
        var actualStart = listStarts[listIndex] || 1;
        // 只修复 start > 1 的段落
        if (actualStart > 1) {
            var currentNum = actualStart;
            for (var i = startLine; i <= endLine; i++) {
                var listItemMatch = result[i].match(/^(\s*)(\d+)\.\s+(.*)$/);
                if (listItemMatch) {
                    var indent = listItemMatch[1], content = listItemMatch[3];
                    result[i] = "" + indent + currentNum + ". " + content;
                    currentNum++;
                }
            }
        }
    });
    return result.join('\n');
}
