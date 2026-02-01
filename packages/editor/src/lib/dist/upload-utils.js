"use strict";
/**
 * 通用图片上传工具
 * 支持自定义上传接口、请求头、进度回调等
 */
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
exports.createUploadHandler = exports.uploadImage = exports.DEFAULT_UPLOAD_URL = exports.DEFAULT_MAX_FILE_SIZE = void 0;
/** 默认最大文件大小 5MB */
exports.DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;
/** 默认上传接口地址 */
exports.DEFAULT_UPLOAD_URL = '/tenant-api/tai/config/img/upload';
/**
 * 默认响应解析函数
 * 适配 { code: 0, data: "url", msg: "" } 格式
 */
var defaultParseResponse = function (response) {
    if (response.code === 0 && response.data) {
        return response.data;
    }
    throw new Error(response.msg || 'Upload failed');
};
/**
 * 通用图片上传函数
 * @param options 上传配置选项
 * @returns Promise resolving to the URL of the uploaded image
 */
exports.uploadImage = function (options) { return __awaiter(void 0, void 0, Promise, function () {
    var file, onProgress, abortSignal, _a, uploadUrl, _b, headers, _c, fileFieldName, _d, extraFormData, _e, parseResponse, formData, token, tenantId;
    return __generator(this, function (_f) {
        file = options.file, onProgress = options.onProgress, abortSignal = options.abortSignal, _a = options.uploadUrl, uploadUrl = _a === void 0 ? exports.DEFAULT_UPLOAD_URL : _a, _b = options.headers, headers = _b === void 0 ? {} : _b, _c = options.fileFieldName, fileFieldName = _c === void 0 ? 'file' : _c, _d = options.extraFormData, extraFormData = _d === void 0 ? {} : _d, _e = options.parseResponse, parseResponse = _e === void 0 ? defaultParseResponse : _e;
        // 验证文件
        if (!file) {
            throw new Error('No file provided');
        }
        formData = new FormData();
        formData.append(fileFieldName, file);
        // 添加额外的表单字段
        Object.entries(extraFormData).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            formData.append(key, value);
        });
        token = localStorage.getItem('token');
        tenantId = localStorage.getItem('tenantId');
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                // 监听取消信号
                if (abortSignal) {
                    abortSignal.addEventListener('abort', function () {
                        xhr.abort();
                        reject(new Error('Upload cancelled'));
                    });
                }
                // 监听上传进度
                xhr.upload.addEventListener('progress', function (event) {
                    if (event.lengthComputable && onProgress) {
                        var progress = Math.round((event.loaded / event.total) * 100);
                        onProgress({ progress: progress });
                    }
                });
                // 监听请求完成
                xhr.addEventListener('load', function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            var url = parseResponse(response);
                            resolve(url);
                        }
                        catch (error) {
                            reject(error instanceof Error
                                ? error
                                : new Error('Failed to parse response'));
                        }
                    }
                    else {
                        reject(new Error("Upload failed with status: " + xhr.status));
                    }
                });
                // 监听请求错误
                xhr.addEventListener('error', function () {
                    reject(new Error('Upload failed'));
                });
                // 监听请求中止
                xhr.addEventListener('abort', function () {
                    reject(new Error('Upload cancelled'));
                });
                // 发送请求
                xhr.open('POST', uploadUrl);
                // 设置默认的认证 headers
                if (token) {
                    xhr.setRequestHeader('Authorization', "Bearer " + token);
                }
                if (tenantId) {
                    xhr.setRequestHeader('tenant-id', tenantId);
                }
                // 设置自定义 headers
                Object.entries(headers).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    xhr.setRequestHeader(key, value);
                });
                xhr.send(formData);
            })];
    });
}); };
/**
 * 创建上传函数工厂
 * 用于生成适配 TipTap 编辑器的上传函数
 * @param customOptions 自定义配置
 * @returns 适配 TipTap 的上传函数
 */
exports.createUploadHandler = function (customOptions) {
    return function (file, onProgress, abortSignal) { return __awaiter(void 0, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.uploadImage(__assign({ file: file,
                    onProgress: onProgress,
                    abortSignal: abortSignal }, customOptions))];
        });
    }); };
};
