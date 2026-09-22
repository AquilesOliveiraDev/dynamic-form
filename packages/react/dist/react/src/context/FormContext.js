"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormContext = void 0;
exports.DynamicFormProvider = DynamicFormProvider;
exports.useFormStore = useFormStore;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.FormContext = (0, react_1.createContext)(null);
function DynamicFormProvider({ form, children, }) {
    return (0, jsx_runtime_1.jsx)(exports.FormContext.Provider, { value: form, children: children });
}
function useFormStore() {
    const context = (0, react_1.useContext)(exports.FormContext);
    if (!context) {
        throw new Error('useFormStore deve ser utilizado dentro de um <DynamicFormProvider>');
    }
    return context;
}
//# sourceMappingURL=FormContext.js.map