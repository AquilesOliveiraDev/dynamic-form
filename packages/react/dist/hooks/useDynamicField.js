"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDynamicField = useDynamicField;
const react_1 = require("react");
const FormContext_js_1 = require("../context/FormContext.js");
function useDynamicField(name) {
    const store = (0, FormContext_js_1.useFormStore)();
    const getSnapshot = (0, react_1.useCallback)(() => {
        const s = store.getState();
        return {
            value: s.values[name],
            error: s.errors[name],
            touched: s.touched[name],
            visible: s.visibility[name] !== false,
            disabled: s.disabledState[name] === true,
        };
    }, [store, name]);
    const subscribe = (0, react_1.useCallback)((onStoreChange) => {
        return store.subscribeField(name, onStoreChange);
    }, [store, name]);
    const fieldState = (0, react_1.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
    const setValue = (0, react_1.useCallback)((value, options) => {
        store.setValue(name, value, options);
    }, [store, name]);
    return {
        ...fieldState,
        setValue,
    };
}
//# sourceMappingURL=useDynamicField.js.map