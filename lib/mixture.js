"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sealMethod = exports.dummyPrimaryMethod = exports.mergeMixture = exports.mixMethod = exports.registerCombination = exports.Combinations = exports.createMixture = exports.getMixture = exports.superMixins = exports.unfoldMixins = exports.cloneAllMixtures = exports.getAllMixtures = void 0;
function getAllMixtures(proto) {
    return proto.hasOwnProperty('__mixtures__') ? proto.__mixtures__ : proto.__mixtures__ = {};
}
exports.getAllMixtures = getAllMixtures;
function cloneAllMixtures(proto) {
    const copy = {}, source = getAllMixtures(proto);
    for (let name in source) {
        copy[name] = source[name].slice();
    }
    return copy;
}
exports.cloneAllMixtures = cloneAllMixtures;
function unfoldMixins(target, Mixins) {
    const appliedMixins = target.__appliedMixins__ || (target.__appliedMixins__ = []);
    const sources = Mixins.map(Mixin => typeof Mixin === 'function' ? Mixin.prototype : Mixin);
    for (let source of sources) {
        if (appliedMixins.indexOf(source) < 0) {
            const sourceMixins = source.__appliedMixins__ || [];
            for (let sourceOfSource of sourceMixins) {
                if (appliedMixins.indexOf(sourceOfSource) < 0) {
                    appliedMixins.push(sourceOfSource);
                }
            }
            appliedMixins.push(source);
        }
    }
    target.__constructors__ = sources
        .map(x => {
        if (x.isPrototypeOf(target))
            return null;
        return x["_constructor"] ?? null;
    })
        .filter(x => x);
    return appliedMixins;
}
exports.unfoldMixins = unfoldMixins;
function superMixins(self, ...args) {
    for (let Ctor of self.__constructors__) {
        Ctor.apply(self, args);
    }
}
exports.superMixins = superMixins;
function getMixture(mixtures, methodName) {
    return mixtures[methodName] || (mixtures[methodName] = createMixture());
}
exports.getMixture = getMixture;
const mixers = [], sealers = [];
function createMixture() {
    return Array(mixers.length);
}
exports.createMixture = createMixture;
exports.Combinations = {};
function registerCombination(name, mixer, sealer = mixer) {
    mixers.push(mixer);
    sealers.push(sealer);
    exports.Combinations[name] = mixers.length - 1;
}
exports.registerCombination = registerCombination;
function mixMethod(mixture, combination, method) {
    const targetMethod = mixture[combination];
    mixture[combination] = targetMethod ?
        mixers[combination](method, targetMethod) :
        method;
}
exports.mixMethod = mixMethod;
function mergeMixture(target, source) {
    for (let i = 0; i < source.length; i++) {
        if (source[i]) {
            mixMethod(target, i, source[i]);
        }
    }
}
exports.mergeMixture = mergeMixture;
const dummyPrimaryMethod = () => { };
exports.dummyPrimaryMethod = dummyPrimaryMethod;
function sealMethod(mixture) {
    let method = exports.dummyPrimaryMethod;
    for (let i = 0; i < mixture.length; i++) {
        if (mixture[i]) {
            method = sealers[i](method, mixture[i]);
        }
    }
    return method;
}
exports.sealMethod = sealMethod;
//# sourceMappingURL=mixture.js.map