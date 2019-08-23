# Flavors object model for JS (development preview)

Mixin engine for modern JS and TypeScript inspired by Howard I. Cannon work for MIT Lisp Machine as described in [Flavors: A non-hierarchical approach to object-oriented programming](http://www.softwarepreservation.org/projects/LISP/MIT/nnnfla1-20040122.pdf).

write something about origins of Flawors and problems it solves

## Design considerations

While admiring the awesome work done by Howard I. Cannon on Flavors for MIT LISP Machine and the LISP community in general during the design of CLOS, we don't have an intent to dramatically change the way how JS developer write his code.

- It must work with both JavaScript and TypeScript naturally, being felt like an evolutionary step forward from traditional JS classes and mixins.
- It must augment the standard JS class models, not substitute it.
- It must utilize TypeScript typeckecking to a maximum possible degree.

# Installation

`npm install mixin-flavors`

## API

### @mixin

Apply base class method combinations as if the inheritance would be the mixin

### @mixin.extends( A, B, ... )

Merge mixins to the target class in the given order.

### @before method( a, b, ... ){ ... }

Execute the given function before the method will be called. Equivalent to `@doBefore( function( a, b, ... ){...} ) method(){}`

```javascript
class A {
    ...

    @before componentWillMount(){
        this.something = "Hi";
    }
}

@mixins( A )
class B {
    componentWillMount(){
        this.state = { text : this.something };
    }
    ...
}
```

### @before.do( aspect ) method( a, b, ... ){ ... }

The general form of `@before` attaching the before aspect to the given primary method.

### @after method( a, b, ... ){ ... }

Execute the given function after the method will be called. Works similar to before.

```javascript
@mixins( Events )
class A {
    @after componentWillUnmount(){
        this.stopListening()
    }
}

@mixins( A )
class B {
    componentWillUnmount(){
        console.log( 'Unmounting' );
    }
}
```

### @after.do( aspect ) method( a, b, ... ){ ... }

The general form of `@after`.

## Initialization

If mixins constructors can take arguments, semantic can become weird and unsafe. In this case, we will be required to manually call their constructors.

If they only allowed to take no arguments, we may initialize them with a single generic call. And, we can use `extend mixins( A, B, C )` to call em automatically. Both `@mixins` and `extends mixins` can be typed to enforce this convention. The problem is, however, that it's too restrictive and we will still need classes.

Finally, the first mixin's constructor might be allowed to take arguments. That, however, would force us to differentiate between mixin sorts, and an effect is generally the same as allowing the mix of classes + mixins.

`extend mixins` allows for interesting effects (automatic initialization, lazy mixin merge), which will need to be investigated.

### mixin.super( this )

Call all the mixins constrtuctors with a given set of arguments. Similar to the standard `super()`.

## `around` method combination

### @around method( a, b, ... ){ ... }

Wrap the method call into the given function. The original method can be called with `applyNextMethod()` and `callNextMethod( a, b, ... )`.

```javascript
class A {
    ...

    @around(
        function( nextProps ){
            return applyNextMethod() && nextProps.a !== this.props.a;
        }
    )
    shouldComponentUpdate( nextProps ){
        return true;
    }
}

@mixins( A )
class B {
    ...

    shouldComponentUpdate( nextProps ){
        return nextProps.b !== this.props.b;
    }
}
```

### @around.do( aspect ) method( a, b, ... ){ ... }

The general form of `@around`.

### mixin.applyNextAround()

Call the next method in chain with the original set of the arguments.

### mixin.nextAround( a, b, ... )

Call the next method in chain with a different set of arguments.

## TODO: Properties combinations

### @after.set( fun ) prop

Execute the given function after the value has changed.

```javascript
class Observer {
    @doAfterSet( function(){
        console.log( `I see you, ${ this.value }!` );
    }) value;
}

@mixins( Observer )
class B {
    ...

    doSomething(){
        this.value = 5; // Will print "I see you, 5"
    }
}
```

### @before.set( fun ) prop

Execute the given function before the value has changed.

```javascript
class Observer {
    @doBeforeSet( function( x ){
        console.log( `I see you last time, ${ x }!` );
    }) value;
}

@mixins( Observer )
class B {
    ...

    doSomething(){
        this.value = 5; // Will print "I see you, 5"
    }
}
```

### @around.set( fun ) prop

Tap into the property modification process.

```javascript
class Observer {
    @doAroundSet( function( x ){
        callNextFunction( Number( x ) );
    }) value;
}

@mixins( Observer )
class B {
    ...

    doSomething(){
        this.value = 5; // Will print "I see you, 5"
    }
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
