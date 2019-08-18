"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mixture_1 = require("./mixture");
mixture_1.registerCombination('PRIMARY', function (prev, next) { return next !== mixture_1.dummyPrimaryMethod ? next : prev; }, function (empty, primary) { return primary || empty; });
mixture_1.registerCombination('AROUND', function (prev, next) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var prevContext = context;
        context = [this, prev, args];
        var res = next.apply(this, args);
        context = prevContext;
        return res;
    };
});
var context;
function callNextMethod() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var self = context[0], method = context[1];
    return method.apply(self, args);
}
exports.callNextMethod = callNextMethod;
function applyNextMethod() {
    var self = context[0], method = context[1], args = context[2];
    return method.apply(self, args);
}
exports.applyNextMethod = applyNextMethod;
mixture_1.registerCombination('BEFORE', function (prev, next) {
    return function () {
        prev.apply(this, arguments);
        next.apply(this, arguments);
    };
}, function (method, before) {
    return function () {
        before.apply(this, arguments);
        return method.apply(this, arguments);
    };
});
mixture_1.registerCombination('AFTER', function (prev, next) {
    return function () {
        next.apply(this, arguments);
        prev.apply(this, arguments);
    };
}, function (method, after) {
    return function () {
        var result = method.apply(this, arguments);
        after.apply(this, arguments);
        return result;
    };
});
//# sourceMappingURL=combinations.js.map