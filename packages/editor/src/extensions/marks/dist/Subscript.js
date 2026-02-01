"use strict";
exports.__esModule = true;
exports.Subscript = void 0;
/*
 * @Description: 自定义下标扩展，支持 Markdown 语法 ~text~
 */
var core_1 = require("@tiptap/core");
exports.Subscript = core_1.Mark.create({
    name: 'subscript',
    addOptions: function () {
        return {
            HTMLAttributes: {}
        };
    },
    parseHTML: function () {
        return [{ tag: 'sub' }];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return ['sub', HTMLAttributes, 0];
    },
    addCommands: function () {
        var _this = this;
        return {
            setSubscript: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.setMark(_this.name);
                };
            },
            toggleSubscript: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.toggleMark(_this.name);
                };
            },
            unsetSubscript: function () {
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
            'Mod-,': function () { return _this.editor.commands.toggleSubscript(); }
        };
    },
    // Markdown 支持
    markdownTokenName: 'subscript',
    parseMarkdown: function (token, helpers) {
        var content = helpers.parseInline(token.tokens || []);
        return helpers.applyMark('subscript', content);
    },
    // Markdown 序列化支持（仅输出，不解析）
    renderMarkdown: function (node, helpers) {
        var content = helpers.renderChildren(node.content || []);
        return "~" + content + "~";
    },
    markdownTokenizer: {
        name: 'subscript',
        level: 'inline',
        start: function (src) { return src.indexOf('~'); },
        tokenize: function (src, _tokens, lexer) {
            var match = /^~([^~]+)~/.exec(src);
            if (!match)
                return undefined;
            return {
                type: 'subscript',
                raw: match[0],
                text: match[1],
                tokens: lexer.inlineTokens(match[1])
            };
        }
    },
    // 设置较低优先级，让数学公式扩展先处理
    priority: 50
});
