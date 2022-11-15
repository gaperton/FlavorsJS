"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.join = void 0;
const decorators_1 = require("./decorators");
const mixture_1 = require("./mixture");
function join(First, ...Mixins) {
    let JoinedMixins = class JoinedMixins extends First {
        constructor(...args) {
            super(...args);
            (0, mixture_1.superMixins)(this);
        }
    };
    JoinedMixins = __decorate([
        decorators_1.mixins(...Mixins)
    ], JoinedMixins);
    return JoinedMixins;
}
exports.join = join;
//# sourceMappingURL=join.js.map