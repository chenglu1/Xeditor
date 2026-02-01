"use strict";

exports.__esModule = true;

require("./TiptapMarkdownEditor.scss");

require("katex/dist/katex.min.css");

var react_1 = require("@tiptap/react");

var react_2 = require("react");

var DualViewEditor_1 = require("./components/DualViewEditor");

var SingleViewEditor_1 = require("./components/SingleViewEditor");

var createEditorExtensions_1 = require("./extensions/createEditorExtensions");

var use_mobile_1 = require("./hooks/use-mobile");

var tiptap_utils_1 = require("./lib/tiptap-utils");

var upload_utils_1 = require("./lib/upload-utils");

var ConfigurableTiptapEditor = function ConfigurableTiptapEditor(_a) {
  var _b = _a.value,
      value = _b === void 0 ? '' : _b,
      _c = _a.contentType,
      contentType = _c === void 0 ? 'markdown' : _c,
      _d = _a.placeholder,
      placeholder = _d === void 0 ? '开始输入...' : _d,
      _e = _a.readOnly,
      readOnly = _e === void 0 ? false : _e,
      _f = _a.showToolbar,
      showToolbar = _f === void 0 ? true : _f,
      toolbarButtons = _a.toolbarButtons,
      _g = _a.dualView,
      dualView = _g === void 0 ? false : _g,
      _h = _a.className,
      className = _h === void 0 ? '' : _h,
      _j = _a.minHeight,
      minHeight = _j === void 0 ? '300px' : _j,
      _k = _a.compact,
      compact = _k === void 0 ? false : _k,
      uploadHandler = _a.uploadHandler,
      uploadUrl = _a.uploadUrl,
      _l = _a.maxFileSize,
      maxFileSize = _l === void 0 ? tiptap_utils_1.MAX_FILE_SIZE : _l,
      maxLength = _a.maxLength,
      onChange = _a.onChange;
  var isMobile = use_mobile_1.useIsMobile();

  var _m = react_2.useState('richtext'),
      activeMode = _m[0],
      setActiveMode = _m[1]; // 创建上传处理函数


  var imageUploadHandler = uploadHandler || upload_utils_1.createUploadHandler({
    uploadUrl: uploadUrl,
    extraFormData: maxFileSize ? {} : undefined
  }); // 判断是否显示某个按钮

  var shouldShowButton = function shouldShowButton(button) {
    if (!toolbarButtons) return true;
    return toolbarButtons.includes(button);
  }; // 工具栏配置


  var toolbarConfig = {
    showUndoRedo: shouldShowButton('undo') || shouldShowButton('redo'),
    showStructure: shouldShowButton('heading') || shouldShowButton('list') || shouldShowButton('blockquote') || shouldShowButton('codeBlock') || shouldShowButton('table'),
    showFormatting: shouldShowButton('bold') || shouldShowButton('italic') || shouldShowButton('strike') || shouldShowButton('code') || shouldShowButton('underline') || shouldShowButton('highlight') || shouldShowButton('link'),
    showScript: shouldShowButton('superscript') || shouldShowButton('subscript'),
    showAlign: shouldShowButton('alignLeft') || shouldShowButton('alignCenter') || shouldShowButton('alignRight') || shouldShowButton('alignJustify'),
    showImage: shouldShowButton('image'),
    shouldShowButton: shouldShowButton
  };
  var editor = react_1.useEditor({
    extensions: createEditorExtensions_1.createEditorExtensions({
      placeholder: placeholder,
      maxFileSize: maxFileSize,
      maxLength: maxLength,
      imageUploadHandler: imageUploadHandler
    }),
    // 不在初始化时设置 content，确保所有内容都通过 setContent → manager.parse 流程
    contentType: contentType === 'markdown' ? 'markdown' : undefined,
    autofocus: false,
    editorProps: {
      attributes: {
        "class": 'focus:outline-none'
      },
      // 阻止超出最大长度的输入
      handleTextInput: function handleTextInput(view, from, to, text) {
        if (!maxLength) return false; // 使用 CharacterCount 扩展的字符数

        var currentCount = view.state.doc.textContent.length;
        var selectedLength = to - from;
        var newLength = currentCount - selectedLength + text.length; // 如果新长度超过限制，阻止输入

        if (newLength > maxLength) {
          return true; // 返回 true 阻止默认行为
        }

        return false;
      },
      // 阻止超出最大长度的粘贴
      handlePaste: function handlePaste(view, event) {
        var _a;

        if (!maxLength) return false;
        var text = ((_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text/plain')) || '';
        var selection = view.state.selection;
        var currentCount = view.state.doc.textContent.length;
        var selectedLength = selection.$to.pos - selection.$from.pos;
        var remaining = maxLength - (currentCount - selectedLength);

        if (remaining <= 0) {
          return true; // 完全阻止粘贴
        } // 如果粘贴内容超出限制，截断后粘贴


        if (text.length > remaining) {
          var truncatedText = text.slice(0, remaining);
          var tr = view.state.tr;
          view.dispatch(tr.insertText(truncatedText, selection.from, selection.to));
          return true; // 阻止默认粘贴行为
        }

        return false;
      }
    },
    parseOptions: {
      preserveWhitespace: 'full'
    },
    editable: !readOnly,
    onUpdate: function onUpdate(_a) {
      var editor = _a.editor;

      if (onChange) {
        try {
          var content = contentType === 'markdown' ? editor.getMarkdown() : editor.getHTML(); // 使用 textContent.length 来统计字符数（与输入限制逻辑一致）

          var characterCount = editor.state.doc.textContent.length;
          onChange(content, contentType, characterCount);
        } catch (_error) {// console.error('Failed to get editor content:', _error);
        }
      }
    }
  }); // 更新编辑器内容：初始化和值改变时都通过 setContent 确保预处理生效

  react_2.useEffect(function () {
    if (editor && value !== undefined) {
      var currentContent = contentType === 'markdown' ? editor.getMarkdown() : editor.getHTML();

      if (value !== currentContent) {
        var options = {
          emitUpdate: false
        };

        if (contentType === 'markdown') {
          options.contentType = 'markdown';
        }

        editor.commands.setContent(value, options);
      }
    }
  }, [value, contentType, editor]);

  if (!editor) {
    return react_2["default"].createElement("div", null, "Loading editor\u2026");
  } // 处理模式切换


  var onModeChange = function onModeChange(mode) {
    setActiveMode(mode); // 双视图模式：模式切换时触发 onChange

    if (dualView && onChange) {
      try {
        var content = contentType === 'markdown' ? editor.getMarkdown() : editor.getHTML();
        onChange(content, contentType);
      } catch (_error) {// console.error('Failed to get editor content:', _error);
      }
    }
  }; // 双视图模式的渲染


  if (dualView) {
    return react_2["default"].createElement(DualViewEditor_1.DualViewEditor, {
      editor: editor,
      activeMode: activeMode,
      placeholder: placeholder,
      readOnly: readOnly,
      contentType: contentType,
      toolbarConfig: toolbarConfig,
      isMobile: isMobile,
      onModeChange: onModeChange
    });
  } // 单视图模式的渲染


  return react_2["default"].createElement(SingleViewEditor_1.SingleViewEditor, {
    editor: editor,
    placeholder: placeholder,
    minHeight: minHeight,
    compact: compact,
    showToolbar: showToolbar,
    toolbarConfig: toolbarConfig,
    isMobile: isMobile,
    className: className
  });
};

exports["default"] = ConfigurableTiptapEditor;