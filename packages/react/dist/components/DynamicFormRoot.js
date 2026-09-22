"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicFormRoot = DynamicFormRoot;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const useDynamicField_js_1 = require("../hooks/useDynamicField.js");
const FieldWrapper = (0, react_1.memo)(function FieldWrapper({ field, renderField, className, }) {
    const { value, error, touched, visible, disabled, setValue } = (0, useDynamicField_js_1.useDynamicField)(field.attr.name);
    if (!visible)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: className, "data-field": field.attr.name, children: renderField({
            field,
            value,
            error,
            touched,
            disabled,
            onChange: setValue,
        }) }));
});
function DynamicFormRoot({ schema, renderField, className, rowClassName, fieldClassName, }) {
    const matrix = schema.fields || schema.structure || [];
    return ((0, jsx_runtime_1.jsx)("div", { className: className, children: matrix.map((row, rowIndex) => ((0, jsx_runtime_1.jsx)("div", { className: rowClassName, style: { display: 'flex', gap: '12px' }, children: row.map((field) => ((0, jsx_runtime_1.jsx)(FieldWrapper, { field: field, renderField: renderField, className: fieldClassName }, field.attr.name))) }, rowIndex))) }));
}
//# sourceMappingURL=DynamicFormRoot.js.map