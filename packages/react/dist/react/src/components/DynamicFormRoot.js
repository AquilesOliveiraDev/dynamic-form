"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicFormRoot = DynamicFormRoot;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
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