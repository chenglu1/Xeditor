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
exports.HeadingDropdownMenu = void 0;
var react_1 = require("react");
var heading_dropdown_1 = require("./heading-dropdown");
/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 * 使用简化版实现替代 Radix UI
 */
exports.HeadingDropdownMenu = react_1.forwardRef(function (props, ref) {
    return React.createElement(heading_dropdown_1.HeadingDropdown, __assign({}, props, { ref: ref }));
});
exports.HeadingDropdownMenu.displayName = 'HeadingDropdownMenu';
exports["default"] = exports.HeadingDropdownMenu;
