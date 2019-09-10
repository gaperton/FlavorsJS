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
        var prevContext = aroundContext, self = this;
        var nextContext = [
            function callNext(args) {
                aroundContext = prevContext;
                var res = next.apply(self, args);
                aroundContext = nextContext;
                return res;
            },
            args
        ];
        aroundContext = nextContext;
        var res = prev.apply(this, args);
        aroundContext = prevContext;
        return res;
    };
}, function (method, arounds) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var prevContext = aroundContext, self = this;
        var nextContext = [
            function callNext(args) {
                aroundContext = prevContext;
                var res = method.apply(self, args);
                aroundContext = nextContext;
                return res;
            },
            args
        ];
        aroundContext = nextContext;
        var res = arounds.apply(this, args);
        aroundContext = prevContext;
        return res;
    };
});
var aroundContext;
function callNextMethod() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return aroundContext[0](args);
}
exports.callNextMethod = callNextMethod;
function applyNextMethod() {
    return aroundContext[0](aroundContext[1]);
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