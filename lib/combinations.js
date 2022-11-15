"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyNextMethod = exports.callNextMethod = void 0;
const mixture_1 = require("./mixture");
(0, mixture_1.registerCombination)('PRIMARY', (prev, next) => next !== mixture_1.dummyPrimaryMethod ? next : prev, (empty, primary) => primary || empty);
(0, mixture_1.registerCombination)('AROUND', (prev, next) => function (...args) {
    const prevContext = aroundContext, self = this;
    const nextContext = [
        function callNext(args) {
            aroundContext = prevContext;
            const res = next.apply(self, args);
            aroundContext = nextContext;
            return res;
        },
        args
    ];
    aroundContext = nextContext;
    const res = prev.apply(this, args);
    aroundContext = prevContext;
    return res;
}, (method, arounds) => function (...args) {
    const prevContext = aroundContext, self = this;
    const nextContext = [
        function callNext(args) {
            aroundContext = prevContext;
            const res = method.apply(self, args);
            aroundContext = nextContext;
            return res;
        },
        args
    ];
    aroundContext = nextContext;
    const res = arounds.apply(this, args);
    aroundContext = prevContext;
    return res;
});
let aroundContext;
function callNextMethod(...args) {
    return aroundContext[0](args);
}
exports.callNextMethod = callNextMethod;
function applyNextMethod() {
    return aroundContext[0](aroundContext[1]);
}
exports.applyNextMethod = applyNextMethod;
(0, mixture_1.registerCombination)('BEFORE', (prev, next) => function () {
    prev.apply(this, arguments);
    next.apply(this, arguments);
}, (method, before) => function () {
    before.apply(this, arguments);
    return method.apply(this, arguments);
});
(0, mixture_1.registerCombination)('AFTER', (prev, next) => function () {
    next.apply(this, arguments);
    prev.apply(this, arguments);
}, (method, after) => function () {
    const result = method.apply(this, arguments);
    after.apply(this, arguments);
    return result;
});
//# sourceMappingURL=combinations.js.map