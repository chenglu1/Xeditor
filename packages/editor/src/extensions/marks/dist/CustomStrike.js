"use strict";
exports.__esModule = true;
exports.CustomStrike = void 0;
/*
 * @Description: 自定义删除线扩展，严格匹配双波浪号 ~~text~~，避免与单波浪号冲突
 */
var core_1 = require("@tiptap/core");
exports.CustomStrike = core_1.Mark.create({
    name: 'strike',
    addOptions: function () {
        return {
            HTMLAttributes: {}
        };
    },
    parseHTML: function () {
        return [
            { tag: 's' },
            { tag: 'del' },
            { tag: 'strike' },
            {
                style: 'text-decoration',
                consuming: false,
                getAttrs: function (style) {
                    return style.includes('line-through') ? {} : false;
                }
            },
        ];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return ['s', HTMLAttributes, 0];
    },
    addCommands: function () {
        var _this = this;
        return {
            setStrike: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.setMark(_this.name);
                };
            },
            toggleStrike: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.toggleMark(_this.name);
                };
            },
            unsetStrike: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.unsetMark(_this.name);
                };
            }
        };
    },
    addKeyboardShortcuts: function () {
        var _this = this;
        return {
            'Mod-Shift-S': function () { return _this.editor.commands.toggleStrike(); }
        };
    },
    // Markdown 序列化支持（仅输出，不解析）
    renderMarkdown: function (node, helpers) {
        var content = helpers.renderChildren(node.content || []);
        return "~~" + content + "~~";
    },
    // 设置较低优先级，让数学公式扩展先处理
    priority: 50
});
