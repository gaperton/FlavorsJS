"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mixture_1 = require("./mixture");
var combinations_1 = require("./combinations");
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
        var baseProto = Object.getPrototypeOf(Target.prototype);
        baseProto === Object.prototype || Mixins.unshift(baseProto);
        mergeMixinsToProto(Target.prototype, Mixins);
    };
}
exports.mixins = mixins;
function mergeMixinsToProto(target, Mixins) {
    var targetMixtures = mixture_1.cloneAllMixtures(target);
    var appliedMixins = mixture_1.unfoldMixins(target, Mixins);
    for (var _i = 0, _a = appliedMixins.reverse(); _i < _a.length; _i++) {
        var source = _a[_i];
        sealMixins(source);
        var sourceMixtures = mixture_1.getAllMixtures(source);
        for (var _b = 0, _c = Object.keys(source); _b < _c.length; _b++) {
            var name_1 = _c[_b];
            var desc = getPropertyDescriptor(source, name_1);
            if (typeof desc.value === 'function' && name_1 !== 'constructor') {
                var targetMixture = getMethodMixture(target, targetMixtures, name_1), sourceMixture = getMethodMixture(source, sourceMixtures, name_1);
                mixture_1.mergeMixture(targetMixture, sourceMixture);
                target[name_1] = mixture_1.sealMethod(targetMixture);
            }
        }
    }
}
function getPropertyDescriptor(source, name) {
    var desc;
    for (var proto = source; proto && !desc; proto = Object.getPrototypeOf(proto)) {
        desc = Object.getOwnPropertyDescriptor(proto, name);
    }
    return desc;
}
function mixin(Class) {
    sealMixins(Class.prototype);
}
exports.mixin = mixin;
mixin.extends = mixins;
mixin.super = mixture_1.superMixins;
mixin.nextAround = combinations_1.callNextMethod;
mixin.applyNextAround = combinations_1.applyNextMethod;
function sealMixins(proto) {
    if (proto !== Object.prototype && !proto.hasOwnProperty('__appliedMixins__')) {
        var baseProto = Object.getPrototypeOf(proto);
        if (baseProto !== Object.prototype) {
            sealMixins(baseProto);
            mergeMixinsToProto(proto, [baseProto]);
        }
    }
}
function aspectDecorator(combination) {
    return function (fun) {
        return function (proto, name, desc) {
            var mixtures = mixture_1.getAllMixtures(proto), mixture = getMethodMixture(proto, mixtures, name);
            mixture_1.mixMethod(mixture, combination, fun);
            desc.value = mixture_1.sealMethod(mixture);
            return desc;
        };
    };
}
function methodDecorator(combination) {
    function decorator(object, name, desc) {
        var mixtures = mixture_1.getAllMixtures(object), mixture = mixture_1.getMixture(mixtures, name);
        mixture_1.mixMethod(mixture, combination, desc.value);
        desc.value = mixture_1.sealMethod(mixture);
        return desc;
    }
    decorator.do = aspectDecorator(combination);
    return decorator;
}
exports.after = methodDecorator(mixture_1.Combinations.AFTER);
exports.before = methodDecorator(mixture_1.Combinations.BEFORE);
exports.around = methodDecorator(mixture_1.Combinations.AROUND);
//# sourceMappingURL=decorators.js.map