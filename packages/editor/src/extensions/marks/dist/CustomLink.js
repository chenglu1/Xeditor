"use strict";
exports.__esModule = true;
exports.CustomLink = void 0;
var extension_link_1 = require("@tiptap/extension-link");
/**
 * 自定义 Link 扩展，添加 Markdown 支持
 */
exports.CustomLink = extension_link_1.Link.extend({
    addStorage: function () {
        return {
            markdown: {
                serialize: function (state, node, parent, index) {
                    var href = node.attrs.href;
                    var title = node.attrs.title;
                    var text = state.esc(node.textContent);
                    if (title) {
                        state.write("[" + text + "](" + href + " \"" + title + "\")");
                    }
                    else {
                        state.write("[" + text + "](" + href + ")");
                    }
                },
                parse: {
                // Markdown 链接解析已由 markdown-it 处理
                // 这里只需要确保正确配置即可
                }
            }
        };
    }
});
