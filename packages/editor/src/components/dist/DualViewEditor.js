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
exports.DualViewEditor = void 0;
var react_1 = require("@tiptap/react");
var react_2 = require("react");
var EditorToolbar_1 = require("./EditorToolbar");
var ModeSwitchButtons_1 = require("./ModeSwitchButtons");
var table_floating_toolbar_1 = require("./tiptap-ui/table-floating-toolbar/table-floating-toolbar");
exports.DualViewEditor = function (_a) {
    var editor = _a.editor, activeMode = _a.activeMode, placeholder = _a.placeholder, readOnly = _a.readOnly, contentType = _a.contentType, toolbarConfig = _a.toolbarConfig, isMobile = _a.isMobile, onModeChange = _a.onModeChange;
    // 使用本地状态管理 textarea 的值
    var _b = react_2.useState(editor.getMarkdown()), textareaValue = _b[0], setTextareaValue = _b[1];
    // 当切换到 markdown 模式时，同步到 textarea
    react_2.useEffect(function () {
        if (activeMode === 'markdown') {
            setTextareaValue(editor.getMarkdown());
        }
    }, [activeMode]); // 移除 editor 依赖，避免不必要的重渲染
    var handleRichtextClick = react_2.useCallback(function () {
        // 切换到富文本前，将 textarea 的内容更新到 editor
        editor === null || editor === void 0 ? void 0 : editor.commands.setContent(textareaValue, __assign({ emitUpdate: false }, (contentType === 'markdown' && { contentType: 'markdown' })));
        onModeChange('richtext');
    }, [textareaValue, contentType, editor, onModeChange]);
    var handleMarkdownClick = react_2.useCallback(function () {
        // 切换到 markdown 时，从 editor 获取最新内容
        setTextareaValue(editor.getMarkdown());
        onModeChange('markdown');
    }, [editor, onModeChange]);
    var handleTextareaChange = react_2.useCallback(function (e) {
        var newContent = e.target.value;
        setTextareaValue(newContent);
        // 实时更新到 editor 并触发 onChange 回调，更新外部状态
        editor === null || editor === void 0 ? void 0 : editor.commands.setContent(newContent, __assign({ emitUpdate: true }, (contentType === 'markdown' && { contentType: 'markdown' })));
    }, [contentType, editor]);
    return (react_2["default"].createElement("div", { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
        react_2["default"].createElement("div", { style: {
                display: 'flex',
                flex: 1,
                minHeight: 0
            } },
            activeMode === 'markdown' && (react_2["default"].createElement("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    flex: 1,
                    minHeight: 0,
                    height: '450px'
                } },
                react_2["default"].createElement("div", { style: {
                        backgroundColor: '#f9fafb',
                        padding: '8px 12px',
                        borderBottom: '1px solid #e5e7eb',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    } },
                    react_2["default"].createElement(ModeSwitchButtons_1.ModeSwitchButtons, { activeMode: activeMode, onRichtextClick: handleRichtextClick, onMarkdownClick: handleMarkdownClick })),
                react_2["default"].createElement("textarea", { value: textareaValue, onChange: handleTextareaChange, placeholder: placeholder, readOnly: readOnly, className: "markdown-editor-textarea", style: {
                        flex: 1,
                        padding: '16px',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        resize: 'none',
                        backgroundColor: 'white',
                        color: '#1f2937',
                        overflow: 'auto',
                        minHeight: 0
                    } }))),
            activeMode === 'richtext' && (react_2["default"].createElement("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    flex: 1,
                    minHeight: 0,
                    height: '450px'
                } },
                react_2["default"].createElement("div", { style: { flex: 1, minHeight: 0, overflow: 'auto' }, className: "tiptap-editor-scrollable" },
                    react_2["default"].createElement("div", { className: "configurable-tiptap-editor" },
                        react_2["default"].createElement("div", { className: "editor-wrapper", style: { border: 'none', borderRadius: 0 } },
                            react_2["default"].createElement(react_1.EditorContext.Provider, { value: { editor: editor } },
                                react_2["default"].createElement(EditorToolbar_1.EditorToolbar, { config: toolbarConfig, isMobile: isMobile, additionalContent: react_2["default"].createElement(ModeSwitchButtons_1.ModeSwitchButtons, { activeMode: activeMode, onRichtextClick: handleRichtextClick, onMarkdownClick: handleMarkdownClick }) }),
                                react_2["default"].createElement("div", { style: {
                                        padding: '12px',
                                        width: '100%',
                                        maxWidth: '100%'
                                    } },
                                    react_2["default"].createElement(react_1.EditorContent, { editor: editor, className: "tiptap" })),
                                react_2["default"].createElement(table_floating_toolbar_1.TableFloatingToolbar, { editor: editor }))))))))));
};
