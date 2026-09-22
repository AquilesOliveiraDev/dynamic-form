"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDynamicForm = useDynamicForm;
const react_1 = require("react");
const core_1 = require("@dynamic-form/core");
function useDynamicForm(config) {
    const store = (0, react_1.useMemo)(() => new core_1.FormStore(config), []);
    const state = (0, react_1.useSyncExternalStore)((callback) => store.subscribe(callback), () => store.getState(), () => store.getState());
    return {
        store,
        state,
        values: state.values,
        errors: state.errors,
        touched: state.touched,
        isDirty: state.isDirty,
        isSubmitting: state.isSubmitting,
        submitCount: state.submitCount,
        setValue: store.setValue.bind(store),
        submit: store.submit.bind(store),
        reset: store.reset.bind(store),
        validateForm: store.validateForm.bind(store),
    };
}
//# sourceMappingURL=useDynamicForm.js.map