# TODO

- analyze conditions when it's safe to use mixins together with classes.
- 

(?)
Consider the restriction that only the class with no-arguments-constructor can be a mixin.
It assumes that regular inheritance might still be needed.
(?)

## extends join( A, B, ... )

The features of this pattern:

- Automatic mixins members initialization, no way to make a mistake.
- TS type is automatically inferred, no need to do manual declaration mergeing.
- Impossible to mix classes with mixins.

When it doesn't work without class decorator?

- Method override won't merge combinations properly.

Options:

- Use it as a notation to define mixins. Forbid mixins to have regular base classes. Use `@mixin` decorator to make it explicit.

    @mixin class A extends B {
        
    }

    @mixin class A extends join( B, C, D ) {

    }

- Allow merging mixins to regular classes with a decorator. Disallow regular classes to be used as a mixin.

    @mixins( C, D )
    class A extends B 

### Definition

- Mixin merge operation produce the mixin class with all the mixins merged.
- It calls all the constructors with no arguments.
- (?) It inherits from the first mixin. All ctor arguments are passed to the first mixin, all others are called w/o arguments. (?)

    type Mixin<T> = ( new () => T ) | T
    function join<A, B>( a : Mixin<A>, b : Mixin<B> ) : () => A & B
    function join<A, B, C>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C> ) : new () => A & B & C
    function join<A, B, C, D>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D> ) : new () => A & B & C & D
    function join<A, B, C, D, E>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E> ) : new () => A & B & C & D & E
    function join<A, B, C, D, E, F>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E>, f : Mixin<F> ) : new () => A & B & C & D & E & F
    function join( ...Mixins : any[] ) : any { ... }

### Relation to classic mixin

join


(1) `join( A, B, C )` is functional equivalent of `join( A, join( B, C ) )` and `join( join( A, B ), C )`, being an associative operation.

(2) `join( A, B )` is an equivalent of

    class A extends B





### Idea

```javascript
// Pattern A
@mixin class B extends A {}


@mixin class C extends join( A, B ){}


interface C extends B {}
@mixins( B )
class C extends A {
    constructor(){
        super();
        superMixins( this );
    }
}

interface C extends A, B {}
@mixins( A, B ) class C {
    constructor(){
    super();
    superMixins( this );
}
```

## Interaction with extended classes

That can create a mess when combined with inheritance. Possible options are:

- Don't work with inheritance at all. Throw exceptions if inheritance is detected. That would seriously restrict FlavorJS applications.
- Treat inheritance as a special case of mixins, preserving the FlavorsJS semantic.

We're going to explore the second option.

To do that, we need to inspect the target's prototype if it have another prototype different from `Object.prototype`. And if it does,
perform the merge in a same way we do with mixins.

(?!)
What if we will have a base class with a constructor performing the lazy application of the mixins across the prototype chain?
It would guarantee from errors.
(?!)

An open question is what to do with members visible across the prototype chain. The valid behavior would be to traverse them, as it seems to be the single correct option to work with traditional class hierarchies.

There's a special case where one of the base classes in a chain has mixins, was extended with a plain class, and then is extended with mixins.

### Test cases

The bottom line from analysis the use cases below is that the solution is simple. Inheritance must be treated as a mixin merge operation, which must be applied as a first mixin.

Inheritance chain itself must be added to appliedMixins as an each of the case classes can be used as mixin. Inheritance of the plain classes are ok.

Usage of subclasses as a mixin source is okay too, once it's properly mixed in himself. For the purposes of PoC, all prototype members can be copied. Plain class hierarchies can be a mixin source once all the prototype chain is traversed. One thing won't work, however. *Methods with `super` calls cannot be properly merged.* Old-school base class method call will work.

#### Plain base class A

- A extended by B with aspects.
- B extends A, C extends B with aspects.
- A extended by B with mixins.

For that to work, *method merge operation must look for primary methods from the whole prototype chain.* _Will not work without @mixins_ as the appliedMixins needs to be set. (?) may be make it a different decorator (?)

#### Base class with aspects

- A with aspects extended by plain class B. _That will work if methods with aspects are not overriden in B_. *@mixins decorator call is required, and it should reseal aspects with new primary methods from B*.
- A with aspects extended by class B with aspects. _If aspect is overriden by primary, it won't work_. *Aspects in a subclass must be merged from mixtures in a base class. @mixins must check all primary methods of B and reseal them*.
- A with aspects extended by class B with mixins. *@mixins must merge A as a mixin first. A must be added to the appliedMixins list and excluded from mixins merge*

Won't work without @mixins.

#### Base class with mixins

- A extended by B with mixins. Applying the merge as if A is the first mixin.
- A extended by B with aspects. Same as 2.2, but _appliedMixins_ has to be transferred.
