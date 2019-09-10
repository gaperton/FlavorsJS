"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAllMixtures(proto) {
    return proto.hasOwnProperty('__mixtures__') ? proto.__mixtures__ : proto.__mixtures__ = {};
}
exports.getAllMixtures = getAllMixtures;
function cloneAllMixtures(proto) {
    var copy = {}, source = getAllMixtures(proto);
    for (var name_1 in source) {
        copy[name_1] = source[name_1].slice();
    }
    return copy;
}
exports.cloneAllMixtures = cloneAllMixtures;
function unfoldMixins(target, Mixins) {
    var appliedMixins = target.__appliedMixins__ || (target.__appliedMixins__ = []);
    var sources = Mixins.map(function (Mixin) { return typeof Mixin === 'function' ? Mixin.prototype : Mixin; });
    for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
        var source = sources_1[_i];
        if (appliedMixins.indexOf(source) < 0) {
            var sourceMixins = source.__appliedMixins__ || [];
            for (var _a = 0, sourceMixins_1 = sourceMixins; _a < sourceMixins_1.length; _a++) {
                var sourceOfSource = sourceMixins_1[_a];
                if (appliedMixins.indexOf(sourceOfSource) < 0) {
                    appliedMixins.push(sourceOfSource);
                }
            }
            appliedMixins.push(source);
        }
    }
    target.__constructors__ = sources
        .map(function (x) { return x.isPrototypeOf(target) ? null : x.constructor; })
        .filter(function (x) { return x; });
    return appliedMixins;
}
exports.unfoldMixins = unfoldMixins;
function superMixins(self) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    for (var _a = 0, _b = self.__constructors__; _a < _b.length; _a++) {
        var Ctor = _b[_a];
        Ctor.apply(self, args);
    }
}
exports.superMixins = superMixins;
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