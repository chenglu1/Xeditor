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
exports.ListDropdownMenu = void 0;
var react_1 = require("react");
var list_dropdown_1 = require("./list-dropdown");
/**
 * Dropdown menu component for selecting list types in a Tiptap editor.
 * 使用原生实现替代 Radix UI
 */
exports.ListDropdownMenu = react_1.forwardRef(function (props, ref) {
    return React.createElement(list_dropdown_1.ListDropdown, __assign({}, props, { ref: ref }));
});
exports.ListDropdownMenu.displayName = 'ListDropdownMenu';
exports["default"] = exports.ListDropdownMenu;
