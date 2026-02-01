"use strict";
exports.__esModule = true;
exports.MobileToolbarContent = exports.MainToolbarContent = void 0;
var react_1 = require("react");
var arrow_left_icon_1 = require("../tiptap-icons/arrow-left-icon");
var highlighter_icon_1 = require("../tiptap-icons/highlighter-icon");
var link_icon_1 = require("../tiptap-icons/link-icon");
var blockquote_button_1 = require("../tiptap-ui/blockquote-button");
var code_block_button_1 = require("../tiptap-ui/code-block-button");
var color_highlight_popover_1 = require("../tiptap-ui/color-highlight-popover");
var heading_dropdown_menu_1 = require("../tiptap-ui/heading-dropdown-menu");
var link_popover_1 = require("../tiptap-ui/link-popover");
var list_dropdown_menu_1 = require("../tiptap-ui/list-dropdown-menu");
var mark_button_1 = require("../tiptap-ui/mark-button");
var table_dropdown_menu_1 = require("../tiptap-ui/table-dropdown-menu");
var text_align_button_1 = require("../tiptap-ui/text-align-button");
var undo_redo_button_1 = require("../tiptap-ui/undo-redo-button");
var image_upload_button_1 = require("../tiptap-ui/image-upload-button");
var button_1 = require("../tiptap-ui-primitive/button");
var spacer_1 = require("../tiptap-ui-primitive/spacer");
var toolbar_1 = require("../tiptap-ui-primitive/toolbar");
exports.MainToolbarContent = function (_a) {
    var onHighlighterClick = _a.onHighlighterClick, onLinkClick = _a.onLinkClick, isMobile = _a.isMobile;
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(spacer_1.Spacer, null),
        react_1["default"].createElement(toolbar_1.ToolbarGroup, null,
            react_1["default"].createElement(undo_redo_button_1.UndoRedoButton, { action: "undo" }),
            react_1["default"].createElement(undo_redo_button_1.UndoRedoButton, { action: "redo" })),
        react_1["default"].createElement(toolbar_1.ToolbarSeparator, null),
        react_1["default"].createElement(toolbar_1.ToolbarGroup, null,
            react_1["default"].createElement(heading_dropdown_menu_1.HeadingDropdownMenu, { levels: [1, 2, 3, 4], portal: isMobile }),
            react_1["default"].createElement(list_dropdown_menu_1.ListDropdownMenu, { types: ['bulletList', 'orderedList', 'taskList'], portal: isMobile }),
            react_1["default"].createElement(blockquote_button_1.BlockquoteButton, null),
            react_1["default"].createElement(code_block_button_1.CodeBlockButton, null),
            react_1["default"].createElement(table_dropdown_menu_1.TableDropdownMenu, null)),
        react_1["default"].createElement(toolbar_1.ToolbarSeparator, null),
        react_1["default"].createElement(toolbar_1.ToolbarGroup, null,
            react_1["default"].createElement(mark_button_1.MarkButton, { type: "bold" }),
            react_1["default"].createElement(mark_button_1.MarkButton, { type: "italic" }),
            react_1["default"].createElement(mark_button_1.MarkButton, { type: "strike" }),
            react_1["default"].createElement(mark_button_1.MarkButton, { type: "code" }),
            react_1["default"].createElement(mark_button_1.MarkButton, { type: "underline" }),
            !isMobile ? (react_1["default"].createElement(color_highlight_popover_1.ColorHighlightPopover, null)) : (react_1["default"].createElement(color_highlight_popover_1.ColorHighlightPopoverButton, { onClick: onHighlighterClick })),
            !isMobile ? react_1["default"].createElement(link_popover_1.LinkPopover, null) : react_1["default"].createElement(link_popover_1.LinkButton, { onClick: onLinkClick })),
        react_1["default"].createElement(toolbar_1.ToolbarSeparator, null),
        react_1["default"].createElement(toolbar_1.ToolbarGroup, null,
            react_1["default"].createElement(mark_button_1.MarkButton, { type: "superscript" }),
            react_1["default"].createElement(mark_button_1.MarkButton, { type: "subscript" })),
        react_1["default"].createElement(toolbar_1.ToolbarSeparator, null),
        react_1["default"].createElement(toolbar_1.ToolbarGroup, null,
            react_1["default"].createElement(text_align_button_1.TextAlignButton, { align: "left" }),
            react_1["default"].createElement(text_align_button_1.TextAlignButton, { align: "center" }),
            react_1["default"].createElement(text_align_button_1.TextAlignButton, { align: "right" }),
            react_1["default"].createElement(text_align_button_1.TextAlignButton, { align: "justify" })),
        react_1["default"].createElement(toolbar_1.ToolbarSeparator, null),
        react_1["default"].createElement(toolbar_1.ToolbarGroup, null,
            react_1["default"].createElement(image_upload_button_1.ImageUploadButton, { text: "Add" })),
        react_1["default"].createElement(spacer_1.Spacer, null)));
};
exports.MobileToolbarContent = function (_a) {
    var type = _a.type, onBack = _a.onBack;
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(toolbar_1.ToolbarGroup, null,
            react_1["default"].createElement(button_1.Button, { "data-style": "ghost", onClick: onBack },
                react_1["default"].createElement(arrow_left_icon_1.ArrowLeftIcon, { className: "tiptap-button-icon" }),
                type === 'highlighter' ? (react_1["default"].createElement(highlighter_icon_1.HighlighterIcon, { className: "tiptap-button-icon" })) : (react_1["default"].createElement(link_icon_1.LinkIcon, { className: "tiptap-button-icon" })))),
        react_1["default"].createElement(toolbar_1.ToolbarSeparator, null),
        type === 'highlighter' ? (react_1["default"].createElement(color_highlight_popover_1.ColorHighlightPopoverContent, null)) : (react_1["default"].createElement(link_popover_1.LinkContent, null))));
};
