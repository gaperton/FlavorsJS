"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAllMixtures(proto) {
    return proto.__mixtures__ || (proto.__mixtures__ = {});
}
exports.getAllMixtures = getAllMixtures;
function canApplyMixin(target, source) {
    var appliedMixins = target.__appliedMixins__ || (target.__appliedMixins__ = []), notApplied = appliedMixins.indexOf(source) < 0;
    if (notApplied)
        appliedMixins.push(source);
    if (!target.mixinsConstructors) {
        target.mixinsConstructors = function () {
            for (var _i = 0, _a = this.__appliedMixins__; _i < _a.length; _i++) {
                var Mixin = _a[_i];
                Mixin.apply(this, arguments);
            }
        };
    }
    return notApplied;
}
exports.canApplyMixin = canApplyMixin;
function getMixture(mixtures, methodName) {
    return mixtures[methodName] || (mixtures[methodName] = createMixture());
}
exports.getMixture = getMixture;
var mixers = [], sealers = [];
function createMixture() {
    return Array(mixers.length);
}
exports.createMixture = createMixture;
exports.Combinations = {};
function registerCombination(name, mixer, sealer) {
    if (sealer === void 0) { sealer = mixer; }
    mixers.push(mixer);
    sealers.push(sealer);
    exports.Combinations[name] = mixers.length - 1;
}
exports.registerCombination = registerCombination;
function mixMethod(mixture, combination, method) {
    var targetMethod = mixture[combination];
    mixture[combination] = targetMethod ?
        mixers[combination](method, targetMethod) :
        method;
}
exports.mixMethod = mixMethod;
function mergeMixture(target, source) {
    for (var i = 0; i < source.length; i++) {
        if (source[i]) {
            mixMethod(target, i, source[i]);
        }
    }
}
exports.mergeMixture = mergeMixture;
exports.dummyPrimaryMethod = function () { };
function sealMethod(mixture) {
    var method = exports.dummyPrimaryMethod;
    for (var i = 0; i < mixture.length; i++) {
        if (mixture[i]) {
            method = sealers[i](method, mixture[i]);
        }
    }
    return method;
}
exports.sealMethod = sealMethod;
//# sourceMappingURL=mixture.js.map