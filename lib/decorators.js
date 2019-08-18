"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mixture_1 = require("./mixture");
function getMethodMixture(proto, mixtures, name) {
    var cached = mixtures[name];
    if (cached)
        return cached;
    var mixture = mixture_1.getMixture(mixtures, name);
    mixture_1.mixMethod(mixture, mixture_1.Combinations.PRIMARY, proto[name]);
    return mixture;
}
function mixins() {
    var Mixins = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        Mixins[_i] = arguments[_i];
    }
    return function (Target) {
        var target = Target.prototype, targetMixtures = mixture_1.getAllMixtures(target);
        for (var _i = 0, Mixins_1 = Mixins; _i < Mixins_1.length; _i++) {
            var Source = Mixins_1[_i];
            var source = Source.prototype;
            if (mixture_1.canApplyMixin(target, source)) {
                var sourceMixtures = mixture_1.getAllMixtures(source);
                for (var _a = 0, _b = Object.getOwnPropertyNames(source); _a < _b.length; _a++) {
                    var name_1 = _b[_a];
                    var desc = Object.getOwnPropertyDescriptor(source, name_1);
                    if (typeof desc.value === 'function' && name_1 !== 'constructor') {
                        var targetMixture = getMethodMixture(target, targetMixtures, name_1), sourceMixture = getMethodMixture(source, sourceMixtures, name_1);
                        mixture_1.mergeMixture(targetMixture, sourceMixture);
                        target[name_1] = mixture_1.sealMethod(targetMixture);
                    }
                }
            }
        }
    };
}
exports.mixins = mixins;
var chainableDecorator = function (combination, fun) {
    return function (proto, name, desc) {
        var mixtures = mixture_1.getAllMixtures(proto), mixture = getMethodMixture(proto, mixtures, name);
        mixture_1.mixMethod(mixture, combination, fun);
        desc.value = mixture_1.sealMethod(mixture);
        return desc;
    };
};
function methodDecorator(combination) {
    return function (arg, name, desc) {
        if (typeof arg === 'function') {
            return chainableDecorator(combination, arg);
        }
        else {
            var mixtures = mixture_1.getAllMixtures(arg), mixture = mixture_1.getMixture(mixtures, name);
            mixture_1.mixMethod(mixture, combination, desc.value);
            desc.value = mixture_1.sealMethod(mixture);
            return desc;
        }
    };
}
exports.after = methodDecorator(mixture_1.Combinations.AFTER);
exports.before = methodDecorator(mixture_1.Combinations.BEFORE);
exports.around = methodDecorator(mixture_1.Combinations.AROUND);
//# sourceMappingURL=decorators.js.map