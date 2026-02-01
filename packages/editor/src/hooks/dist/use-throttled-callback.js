"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useThrottledCallback = void 0;
var lodash_es_1 = require("lodash-es");
var react_1 = require("react");
var use_unmount_1 = require("./use-unmount");
var defaultOptions = {
    leading: false,
    trailing: true
};
/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useThrottledCallback(fn, wait, dependencies, options) {
    if (wait === void 0) { wait = 250; }
    if (dependencies === void 0) { dependencies = []; }
    if (options === void 0) { options = defaultOptions; }
    var handler = react_1.useMemo(function () { return lodash_es_1.throttle(fn, wait, options); }, __spreadArrays(dependencies));
    use_unmount_1.useUnmount(function () {
        handler.cancel();
    });
    return handler;
}
exports.useThrottledCallback = useThrottledCallback;
exports["default"] = useThrottledCallback;
