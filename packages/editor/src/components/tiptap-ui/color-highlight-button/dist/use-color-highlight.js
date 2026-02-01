'use client';
"use strict";
exports.__esModule = true;
exports.useColorHighlight = exports.shouldShowButton = exports.removeHighlight = exports.isColorHighlightActive = exports.canColorHighlight = exports.pickHighlightColorsByValue = exports.HIGHLIGHT_COLORS = exports.COLOR_HIGHLIGHT_SHORTCUT_KEY = void 0;
var react_1 = require("react");
var react_hotkeys_hook_1 = require("react-hotkeys-hook");
// --- Hooks ---
var use_mobile_1 = require("../../../hooks/use-mobile");
var use_tiptap_editor_1 = require("../../../hooks/use-tiptap-editor");
// --- Lib ---
var tiptap_utils_1 = require("../../../lib/tiptap-utils");
// --- Icons ---
var highlighter_icon_1 = require("../../tiptap-icons/highlighter-icon");
exports.COLOR_HIGHLIGHT_SHORTCUT_KEY = 'mod+shift+h';
exports.HIGHLIGHT_COLORS = [
    {
        label: 'Default background',
        value: 'var(--tt-bg-color)',
        border: 'var(--tt-bg-color-contrast)'
    },
    // {
    //   label: 'Gray background',
    //   value: 'var(--tt-color-highlight-gray)',
    //   border: 'var(--tt-color-highlight-gray-contrast)',
    // },
    // {
    //   label: 'Brown background',
    //   value: 'var(--tt-color-highlight-brown)',
    //   border: 'var(--tt-color-highlight-brown-contrast)',
    // },
    // {
    //   label: 'Orange background',
    //   value: 'var(--tt-color-highlight-orange)',
    //   border: 'var(--tt-color-highlight-orange-contrast)',
    // },
    {
        label: 'Yellow background',
        value: 'var(--tt-color-highlight-yellow)',
        border: 'var(--tt-color-highlight-yellow-contrast)'
    },
];
function pickHighlightColorsByValue(values) {
    var colorMap = new Map(exports.HIGHLIGHT_COLORS.map(function (color) { return [color.value, color]; }));
    return values
        .map(function (value) { return colorMap.get(value); })
        .filter(function (color) { return !!color; });
}
exports.pickHighlightColorsByValue = pickHighlightColorsByValue;
/**
 * Checks if highlight can be applied based on the mode and current editor state
 */
function canColorHighlight(editor, mode) {
    if (mode === void 0) { mode = 'mark'; }
    if (!editor || !editor.isEditable)
        return false;
    if (mode === 'mark') {
        if (!tiptap_utils_1.isMarkInSchema('highlight', editor) ||
            tiptap_utils_1.isNodeTypeSelected(editor, ['image']))
            return false;
        return editor.can().setMark('highlight');
    }
    else {
        if (!tiptap_utils_1.isExtensionAvailable(editor, ['nodeBackground']))
            return false;
        try {
            // @ts-expect-error - Custom extension command
            return editor.can().toggleNodeBackgroundColor('test');
        }
        catch (_a) {
            return false;
        }
    }
}
exports.canColorHighlight = canColorHighlight;
/**
 * Checks if highlight is currently active
 */
function isColorHighlightActive(editor, highlightColor, mode) {
    var _a;
    if (mode === void 0) { mode = 'mark'; }
    if (!editor || !editor.isEditable)
        return false;
    if (mode === 'mark') {
        return highlightColor
            ? editor.isActive('highlight', { color: highlightColor })
            : editor.isActive('highlight');
    }
    else {
        if (!highlightColor)
            return false;
        try {
            var state = editor.state;
            var selection = state.selection;
            var $pos = selection.$anchor;
            for (var depth = $pos.depth; depth >= 0; depth--) {
                var node = $pos.node(depth);
                if (node && ((_a = node.attrs) === null || _a === void 0 ? void 0 : _a.backgroundColor) === highlightColor) {
                    return true;
                }
            }
            return false;
        }
        catch (_b) {
            return false;
        }
    }
}
exports.isColorHighlightActive = isColorHighlightActive;
/**
 * Removes highlight based on the mode
 */
function removeHighlight(editor, mode) {
    if (mode === void 0) { mode = 'mark'; }
    if (!editor || !editor.isEditable)
        return false;
    if (!canColorHighlight(editor, mode))
        return false;
    if (mode === 'mark') {
        return editor.chain().focus().unsetMark('highlight').run();
    }
    else {
        // @ts-expect-error - Custom extension command
        return editor.chain().focus().unsetNodeBackgroundColor().run();
    }
}
exports.removeHighlight = removeHighlight;
/**
 * Determines if the highlight button should be shown
 */
function shouldShowButton(props) {
    var editor = props.editor, hideWhenUnavailable = props.hideWhenUnavailable, mode = props.mode;
    if (!editor)
        return false;
    if (mode === 'mark') {
        if (!tiptap_utils_1.isMarkInSchema('highlight', editor))
            return false;
    }
    else {
        if (!tiptap_utils_1.isExtensionAvailable(editor, ['nodeBackground']))
            return false;
    }
    if (hideWhenUnavailable) {
        return (editor.isEditable &&
            !editor.isActive('code') &&
            canColorHighlight(editor, mode));
    }
    return true;
}
exports.shouldShowButton = shouldShowButton;
function useColorHighlight(config) {
    var providedEditor = config.editor, label = config.label, highlightColor = config.highlightColor, _a = config.hideWhenUnavailable, hideWhenUnavailable = _a === void 0 ? false : _a, _b = config.mode, mode = _b === void 0 ? 'mark' : _b, onApplied = config.onApplied;
    var editor = use_tiptap_editor_1.useTiptapEditor(providedEditor).editor;
    var isMobile = use_mobile_1.useIsMobile();
    var _c = react_1.useState(true), isVisible = _c[0], setIsVisible = _c[1];
    var canColorHighlightState = canColorHighlight(editor, mode);
    var isActive = isColorHighlightActive(editor, highlightColor, mode);
    react_1.useEffect(function () {
        if (!editor)
            return;
        var handleSelectionUpdate = function () {
            setIsVisible(shouldShowButton({ editor: editor, hideWhenUnavailable: hideWhenUnavailable, mode: mode }));
        };
        handleSelectionUpdate();
        editor.on('selectionUpdate', handleSelectionUpdate);
        return function () {
            editor.off('selectionUpdate', handleSelectionUpdate);
        };
    }, [editor, hideWhenUnavailable, mode]);
    var handleColorHighlight = react_1.useCallback(function () {
        if (!editor || !canColorHighlightState || !highlightColor || !label)
            return false;
        if (mode === 'mark') {
            if (editor.state.storedMarks) {
                var highlightMarkType = editor.schema.marks.highlight;
                if (highlightMarkType) {
                    editor.view.dispatch(editor.state.tr.removeStoredMark(highlightMarkType));
                }
            }
            setTimeout(function () {
                var success = editor
                    .chain()
                    .focus()
                    .toggleMark('highlight', { color: highlightColor })
                    .run();
                if (success) {
                    onApplied === null || onApplied === void 0 ? void 0 : onApplied({ color: highlightColor, label: label, mode: mode });
                }
                return success;
            }, 0);
            return true;
        }
        else {
            var success = editor
                .chain()
                .focus()
                // @ts-expect-error - Custom extension command
                .toggleNodeBackgroundColor(highlightColor)
                .run();
            if (success) {
                onApplied === null || onApplied === void 0 ? void 0 : onApplied({ color: highlightColor, label: label, mode: mode });
            }
            return success;
        }
    }, [canColorHighlightState, highlightColor, editor, label, onApplied, mode]);
    var handleRemoveHighlight = react_1.useCallback(function () {
        var success = removeHighlight(editor, mode);
        if (success) {
            onApplied === null || onApplied === void 0 ? void 0 : onApplied({ color: '', label: 'Remove highlight', mode: mode });
        }
        return success;
    }, [editor, onApplied, mode]);
    react_hotkeys_hook_1.useHotkeys(exports.COLOR_HIGHLIGHT_SHORTCUT_KEY, function (event) {
        event.preventDefault();
        handleColorHighlight();
    }, {
        enabled: isVisible && canColorHighlightState,
        enableOnContentEditable: !isMobile,
        enableOnFormTags: true
    });
    return {
        isVisible: isVisible,
        isActive: isActive,
        handleColorHighlight: handleColorHighlight,
        handleRemoveHighlight: handleRemoveHighlight,
        canColorHighlight: canColorHighlightState,
        label: label || "Highlight",
        shortcutKeys: exports.COLOR_HIGHLIGHT_SHORTCUT_KEY,
        Icon: highlighter_icon_1.HighlighterIcon,
        mode: mode
    };
}
exports.useColorHighlight = useColorHighlight;
