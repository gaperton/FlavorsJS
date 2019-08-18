export declare function getAllMixtures(proto: any): MethodsMixtures;
export declare function canApplyMixin(target: any, source: any): boolean;
declare type MethodsMixtures = {
    [methodName: string]: Mixture;
};
declare type Mixture = Function[];
export declare function getMixture(mixtures: MethodsMixtures, methodName: string): Mixture;
export declare type Mixer = (next: Function, prev: Function) => Function;
export declare type Sealer = (method: Function, combination: Function) => Function;
export declare function createMixture(): Mixture;
export declare const Combinations: {
    [key: string]: Combination;
};
export declare type Combination = number;
export declare function registerCombination(name: string, mixer: Mixer, sealer?: Sealer): void;
export declare function mixMethod(mixture: Mixture, combination: Combination, method: Function): void;
export declare function mergeMixture(target: Mixture, source: Mixture): void;
export declare const dummyPrimaryMethod: () => void;
export declare function sealMethod(mixture: Mixture): Function;
export {};
//# sourceMappingURL=mixture.d.ts.map