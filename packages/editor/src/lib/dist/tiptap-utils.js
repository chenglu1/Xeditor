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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.selectCurrentBlockContent = exports.updateNodesAttr = exports.sanitizeUrl = exports.isAllowedUri = exports.handleImageUpload = exports.selectionWithinConvertibleTypes = exports.isNodeTypeSelected = exports.findNodePosition = exports.findNodeAtPosition = exports.isExtensionAvailable = exports.isValidPosition = exports.focusNextNode = exports.isNodeInSchema = exports.isMarkInSchema = exports.parseShortcutKeys = exports.formatShortcutKey = exports.isMac = exports.cn = exports.SR_ONLY = exports.MAC_SYMBOLS = exports.MAX_FILE_SIZE = void 0;
var state_1 = require("@tiptap/pm/state");
exports.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
exports.MAC_SYMBOLS = {
    mod: '⌘',
    command: '⌘',
    meta: '⌘',
    ctrl: '⌃',
    control: '⌃',
    alt: '⌥',
    option: '⌥',
    shift: '⇧',
    backspace: 'Del',
    "delete": '⌦',
    enter: '⏎',
    escape: '⎋',
    capslock: '⇪'
};
exports.SR_ONLY = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0
};
function cn() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return classes.filter(Boolean).join(' ');
}
exports.cn = cn;
/**
 * Determines if the current platform is macOS
 * @returns boolean indicating if the current platform is Mac
 */
function isMac() {
    return (typeof navigator !== 'undefined' &&
        navigator.platform.toLowerCase().includes('mac'));
}
exports.isMac = isMac;
/**
 * Formats a shortcut key based on the platform (Mac or non-Mac)
 * @param key - The key to format (e.g., "ctrl", "alt", "shift")
 * @param isMac - Boolean indicating if the platform is Mac
 * @param capitalize - Whether to capitalize the key (default: true)
 * @returns Formatted shortcut key symbol
 */
exports.formatShortcutKey = function (key, isMac, capitalize) {
    if (capitalize === void 0) { capitalize = true; }
    if (isMac) {
        var lowerKey = key.toLowerCase();
        return exports.MAC_SYMBOLS[lowerKey] || (capitalize ? key.toUpperCase() : key);
    }
    return capitalize ? key.charAt(0).toUpperCase() + key.slice(1) : key;
};
/**
 * Parses a shortcut key string into an array of formatted key symbols
 * @param shortcutKeys - The string of shortcut keys (e.g., "ctrl-alt-shift")
 * @param delimiter - The delimiter used to split the keys (default: "-")
 * @param capitalize - Whether to capitalize the keys (default: true)
 * @returns Array of formatted shortcut key symbols
 */
exports.parseShortcutKeys = function (props) {
    var shortcutKeys = props.shortcutKeys, _a = props.delimiter, delimiter = _a === void 0 ? '+' : _a, _b = props.capitalize, capitalize = _b === void 0 ? true : _b;
    if (!shortcutKeys)
        return [];
    return shortcutKeys
        .split(delimiter)
        .map(function (key) { return key.trim(); })
        .map(function (key) { return exports.formatShortcutKey(key, isMac(), capitalize); });
};
/**
 * Checks if a mark exists in the editor schema
 * @param markName - The name of the mark to check
 * @param editor - The editor instance
 * @returns boolean indicating if the mark exists in the schema
 */
exports.isMarkInSchema = function (markName, editor) {
    if (!(editor === null || editor === void 0 ? void 0 : editor.schema))
        return false;
    return editor.schema.spec.marks.get(markName) !== undefined;
};
/**
 * Checks if a node exists in the editor schema
 * @param nodeName - The name of the node to check
 * @param editor - The editor instance
 * @returns boolean indicating if the node exists in the schema
 */
exports.isNodeInSchema = function (nodeName, editor) {
    if (!(editor === null || editor === void 0 ? void 0 : editor.schema))
        return false;
    return editor.schema.spec.nodes.get(nodeName) !== undefined;
};
/**
 * Moves the focus to the next node in the editor
 * @param editor - The editor instance
 * @returns boolean indicating if the focus was moved
 */
function focusNextNode(editor) {
    var state = editor.state, view = editor.view;
    var doc = state.doc, selection = state.selection;
    var nextSel = state_1.Selection.findFrom(selection.$to, 1, true);
    if (nextSel) {
        view.dispatch(state.tr.setSelection(nextSel).scrollIntoView());
        return true;
    }
    var paragraphType = state.schema.nodes.paragraph;
    if (!paragraphType) {
        // console.warn('No paragraph node type found in schema.');
        return false;
    }
    var end = doc.content.size;
    var para = paragraphType.create();
    var tr = state.tr.insert(end, para);
    // Place the selection inside the new paragraph
    var $inside = tr.doc.resolve(end + 1);
    tr = tr.setSelection(state_1.TextSelection.near($inside)).scrollIntoView();
    view.dispatch(tr);
    return true;
}
exports.focusNextNode = focusNextNode;
/**
 * Checks if a value is a valid number (not null, undefined, or NaN)
 * @param value - The value to check
 * @returns boolean indicating if the value is a valid number
 */
function isValidPosition(pos) {
    return typeof pos === 'number' && pos >= 0;
}
exports.isValidPosition = isValidPosition;
/**
 * Checks if one or more extensions are registered in the Tiptap editor.
 * @param editor - The Tiptap editor instance
 * @param extensionNames - A single extension name or an array of names to check
 * @returns True if at least one of the extensions is available, false otherwise
 */
function isExtensionAvailable(editor, extensionNames) {
    if (!editor)
        return false;
    var names = Array.isArray(extensionNames)
        ? extensionNames
        : [extensionNames];
    var found = names.some(function (name) {
        return editor.extensionManager.extensions.some(function (ext) { return ext.name === name; });
    });
    if (!found) {
        // console.warn(
        //   `None of the extensions [${names.join(', ')}] were found in the editor schema. Ensure they are included in the editor configuration.`,
        // );
    }
    return found;
}
exports.isExtensionAvailable = isExtensionAvailable;
/**
 * Finds a node at the specified position with error handling
 * @param editor The Tiptap editor instance
 * @param position The position in the document to find the node
 * @returns The node at the specified position, or null if not found
 */
function findNodeAtPosition(editor, position) {
    try {
        var node = editor.state.doc.nodeAt(position);
        if (!node) {
            // console.warn(`No node found at position ${position}`);
            return null;
        }
        return node;
    }
    catch (_error) {
        // console.error(`Error getting node at position ${position}:`, _error);
        return null;
    }
}
exports.findNodeAtPosition = findNodeAtPosition;
/**
 * Finds the position and instance of a node in the document
 * @param props Object containing editor, node (optional), and nodePos (optional)
 * @param props.editor The Tiptap editor instance
 * @param props.node The node to find (optional if nodePos is provided)
 * @param props.nodePos The position of the node to find (optional if node is provided)
 * @returns An object with the position and node, or null if not found
 */
function findNodePosition(props) {
    var _a;
    var editor = props.editor, node = props.node, nodePos = props.nodePos;
    if (!editor || !((_a = editor.state) === null || _a === void 0 ? void 0 : _a.doc))
        return null;
    // Zero is valid position
    var hasValidNode = node !== undefined && node !== null;
    var hasValidPos = isValidPosition(nodePos);
    if (!hasValidNode && !hasValidPos) {
        return null;
    }
    // 搜索文档中的节点
    if (hasValidNode) {
        var foundPos_1 = -1;
        var foundNode_1 = null;
        editor.state.doc.descendants(function (currentNode, pos) {
            if (currentNode === node) {
                foundPos_1 = pos;
                foundNode_1 = currentNode;
                return false;
            }
            return true;
        });
        if (foundPos_1 !== -1 && foundNode_1 !== null) {
            return { pos: foundPos_1, node: foundNode_1 };
        }
    }
    // If we have a valid position, use findNodeAtPosition
    if (hasValidPos) {
        var nodeAtPos = findNodeAtPosition(editor, nodePos);
        if (nodeAtPos) {
            return { pos: nodePos, node: nodeAtPos };
        }
    }
    return null;
}
exports.findNodePosition = findNodePosition;
/**
 * Checks if the current selection in the editor is a node selection of specified types
 * @param editor The Tiptap editor instance
 * @param types An array of node type names to check against
 * @returns boolean indicating if the selected node matches any of the specified types
 */
function isNodeTypeSelected(editor, types) {
    if (types === void 0) { types = []; }
    if (!editor || !editor.state.selection)
        return false;
    var state = editor.state;
    var selection = state.selection;
    if (selection.empty)
        return false;
    if (selection instanceof state_1.NodeSelection) {
        var node = selection.node;
        return node ? types.includes(node.type.name) : false;
    }
    return false;
}
exports.isNodeTypeSelected = isNodeTypeSelected;
/**
 * Check whether the current selection is fully within nodes
 * whose type names are in the provided `types` list.
 *
 * - NodeSelection → checks the selected node.
 * - Text/AllSelection → ensures all textblocks within [from, to) are allowed.
 */
function selectionWithinConvertibleTypes(editor, types) {
    var _a, _b;
    if (types === void 0) { types = []; }
    if (!editor || types.length === 0)
        return false;
    var state = editor.state;
    var selection = state.selection;
    var allowed = new Set(types);
    if (selection instanceof state_1.NodeSelection) {
        var nodeType = (_b = (_a = selection.node) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.name;
        return !!nodeType && allowed.has(nodeType);
    }
    if (selection instanceof state_1.TextSelection || selection instanceof state_1.AllSelection) {
        var valid_1 = true;
        state.doc.nodesBetween(selection.from, selection.to, function (node) {
            if (node.isTextblock && !allowed.has(node.type.name)) {
                valid_1 = false;
                return false; // stop early
            }
            return valid_1;
        });
        return valid_1;
    }
    return false;
}
exports.selectionWithinConvertibleTypes = selectionWithinConvertibleTypes;
/**
 * Handles image upload with progress tracking and abort capability
 * @param file The file to upload
 * @param onProgress Optional callback for tracking upload progress
 * @param abortSignal Optional AbortSignal for cancelling the upload
 * @returns Promise resolving to the URL of the uploaded image
 */
exports.handleImageUpload = function (file, onProgress, abortSignal) { return __awaiter(void 0, void 0, Promise, function () {
    var progress;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Validate file
                if (!file) {
                    throw new Error('No file provided');
                }
                if (file.size > exports.MAX_FILE_SIZE) {
                    throw new Error("File size exceeds maximum allowed (" + exports.MAX_FILE_SIZE / (1024 * 1024) + "MB)");
                }
                progress = 0;
                _a.label = 1;
            case 1:
                if (!(progress <= 100)) return [3 /*break*/, 4];
                if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                    throw new Error('Upload cancelled');
                }
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
            case 2:
                _a.sent();
                onProgress === null || onProgress === void 0 ? void 0 : onProgress({ progress: progress });
                _a.label = 3;
            case 3:
                progress += 10;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, '/images/tiptap-ui-placeholder-image.jpg'];
        }
    });
}); };
var ATTR_WHITESPACE = 
// eslint-disable-next-line no-control-regex
/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;
function isAllowedUri(uri, protocols) {
    var allowedProtocols = [
        'http',
        'https',
        'ftp',
        'ftps',
        'mailto',
        'tel',
        'callto',
        'sms',
        'cid',
        'xmpp',
    ];
    if (protocols) {
        protocols.forEach(function (protocol) {
            var nextProtocol = typeof protocol === 'string' ? protocol : protocol.scheme;
            if (nextProtocol) {
                allowedProtocols.push(nextProtocol);
            }
        });
    }
    return (!uri ||
        uri.replace(ATTR_WHITESPACE, '').match(new RegExp(
        // eslint-disable-next-line no-useless-escape
        "^(?:(?:" + allowedProtocols.join('|') + "):|[^a-z]|[a-z0-9+.-]+(?:[^a-z+.-:]|$))", 'i')));
}
exports.isAllowedUri = isAllowedUri;
function sanitizeUrl(inputUrl, baseUrl, protocols) {
    try {
        var url = new URL(inputUrl, baseUrl);
        if (isAllowedUri(url.href, protocols)) {
            return url.href;
        }
    }
    catch (_a) {
        // If URL creation fails, it's considered invalid
    }
    return '#';
}
exports.sanitizeUrl = sanitizeUrl;
/**
 * Update a single attribute on multiple nodes.
 *
 * @param tr - The transaction to mutate
 * @param targets - Array of { node, pos }
 * @param attrName - Attribute key to update
 * @param next - New value OR updater function receiving previous value
 *               Pass `undefined` to remove the attribute.
 * @returns true if at least one node was updated, false otherwise
 */
function updateNodesAttr(tr, targets, attrName, next) {
    if (!targets.length)
        return false;
    var changed = false;
    for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
        var pos = targets_1[_i].pos;
        // Always re-read from the transaction's current doc
        var currentNode = tr.doc.nodeAt(pos);
        if (!currentNode)
            continue;
        var prevValue = currentNode.attrs[attrName];
        var resolvedNext = typeof next === 'function'
            ? next(prevValue)
            : next;
        if (prevValue === resolvedNext)
            continue;
        var nextAttrs = __assign({}, currentNode.attrs);
        if (resolvedNext === undefined) {
            // Remove the key entirely instead of setting null
            delete nextAttrs[attrName];
        }
        else {
            nextAttrs[attrName] = resolvedNext;
        }
        tr.setNodeMarkup(pos, undefined, nextAttrs);
        changed = true;
    }
    return changed;
}
exports.updateNodesAttr = updateNodesAttr;
/**
 * Selects the entire content of the current block node if the selection is empty.
 * If the selection is not empty, it does nothing.
 * @param editor The Tiptap editor instance
 */
function selectCurrentBlockContent(editor) {
    var _a = editor.state, selection = _a.selection, doc = _a.doc;
    if (!selection.empty)
        return;
    var $pos = selection.$from;
    var blockNode = null;
    var blockPos = -1;
    for (var depth = $pos.depth; depth >= 0; depth--) {
        var node = $pos.node(depth);
        var pos = $pos.start(depth);
        if (node.isBlock && node.textContent.trim()) {
            blockNode = node;
            blockPos = pos;
            break;
        }
    }
    if (blockNode && blockPos >= 0) {
        var from = blockPos;
        var to = blockPos + blockNode.nodeSize - 2; // -2 to exclude the closing tag
        if (from < to) {
            var $from = doc.resolve(from);
            var $to = doc.resolve(to);
            var newSelection = state_1.TextSelection.between($from, $to, 1);
            if (newSelection && !selection.eq(newSelection)) {
                editor.view.dispatch(editor.state.tr.setSelection(newSelection));
            }
        }
    }
}
exports.selectCurrentBlockContent = selectCurrentBlockContent;
