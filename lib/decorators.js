"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.around = exports.before = exports.after = exports.mixin = exports.mixins = void 0;
const mixture_1 = require("./mixture");
const combinations_1 = require("./combinations");
function getMethodMixture(proto, mixtures, name) {
    const cached = mixtures[name];
    if (cached)
        return cached;
    const mixture = (0, mixture_1.getMixture)(mixtures, name);
    (0, mixture_1.mixMethod)(mixture, mixture_1.Combinations.PRIMARY, proto[name]);
    return mixture;
}
function mixins(...Mixins) {
    return Target => {
        const baseProto = Object.getPrototypeOf(Target.prototype);
        baseProto === Object.prototype || Mixins.unshift(baseProto);
        mergeMixinsToProto(Target.prototype, Mixins);
    };
}
exports.mixins = mixins;
function mergeMixinsToProto(target, Mixins) {
    const targetMixtures = (0, mixture_1.cloneAllMixtures)(target);
    const appliedMixins = (0, mixture_1.unfoldMixins)(target, Mixins);
    for (let source of appliedMixins.reverse()) {
        sealMixins(source);
        const sourceMixtures = (0, mixture_1.getAllMixtures)(source);
        const descriptors = Object.getOwnPropertyDescriptors(source);
        for (let name of Object.keys(descriptors)) {
            const desc = descriptors[name];
            if (typeof desc.value === 'function' && name !== 'constructor') {
                const targetMixture = getMethodMixture(target, targetMixtures, name), sourceMixture = getMethodMixture(source, sourceMixtures, name);
                (0, mixture_1.mergeMixture)(targetMixture, sourceMixture);
                target[name] = (0, mixture_1.sealMethod)(targetMixture);
            }
        }
    }
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
        const baseProto = Object.getPrototypeOf(proto);
        if (baseProto !== Object.prototype) {
            sealMixins(baseProto);
            mergeMixinsToProto(proto, [baseProto]);
        }
    }
}
function aspectDecorator(combination) {
    return (fun) => (proto, name, desc) => {
        const mixtures = (0, mixture_1.getAllMixtures)(proto), mixture = getMethodMixture(proto, mixtures, name);
        (0, mixture_1.mixMethod)(mixture, combination, fun);
        desc.value = (0, mixture_1.sealMethod)(mixture);
        return desc;
    };
}
function methodDecorator(combination) {
    function decorator(object, name, desc) {
        const mixtures = (0, mixture_1.getAllMixtures)(object), mixture = (0, mixture_1.getMixture)(mixtures, name);
        (0, mixture_1.mixMethod)(mixture, combination, desc.value);
        desc.value = (0, mixture_1.sealMethod)(mixture);
        return desc;
    }
    decorator.do = aspectDecorator(combination);
    return decorator;
}
exports.after = methodDecorator(mixture_1.Combinations.AFTER);
exports.before = methodDecorator(mixture_1.Combinations.BEFORE);
exports.around = methodDecorator(mixture_1.Combinations.AROUND);
//# sourceMappingURL=decorators.js.map