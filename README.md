# Flavors object model for JS (development preview)

Mixin engine for modern JS and TypeScript inspired by Howard I. Cannon work for MIT Lisp Machine as described
in [Flavors: A non-hierarchical approach to object-oriented programming](http://www.softwarepreservation.org/projects/LISP/MIT/nnnfla1-20040122.pdf).

write something about origins of Flavors and problems it solves

## Installation

`npm install mixin-flavors`

## Basic usage

In its basic use case, FlavorsJS gives you multiple inheritance in JS.

### join( Base, B, ... )

Produce a new class which is a combination of given classes. Resulting class will be the proper subclass of `Base`
merging in the prototype
methods of other classes. Resulting class constructor will call the `Base` constructor with a same set of arguments, and
mixin constructors with no arguments in a same order mixins are mentioned (??).

`join` operation is meant to be used in conjunction with `class extends` to implement multiple inheritance.

```javascript
class A {
    a = 1;

    f() {
        return 'a';
    }
}

class B {
    b = 1;

    g() {
        return 'b';
    }
}

class C extends join(A, B) {
    g() {
        return 'c'
    }
}

const c = new C();

expect(c.a).toBe(1)
expect(c.b).toBe(1)
expect(c.f()).toBe('a')
expect(c.g()).toBe('c')
```

### @mixin.extends( A, B, ... )

Merge methods of given classes to the existing class definition.

Use `mixin.super( this )` to call all the mixins constructors with no arguments, or call them inidividually
with `A.call( this )`, `B.call( this )`, etc.

```javascript
class A {
    a = 1;

    f() {
        return 'a';
    }
}

class B {
    b = 1;

    g() {
        return 'b';
    }
}

@mixin.extends(A, B) class C {
    constructor() {
        mixin.super(this);
    }

    g() {
        return 'c'
    }
}

const c = new C();

expect(c.a).toBe(1)
expect(c.b).toBe(1)
expect(c.f()).toBe('a')
expect(c.g()).toBe('c')
```

## Advanced usage: method combinations

FlavorsJS implements _method combinations_ as found in Common LISP Object System and Flavors system from MIT LISP
Machine.
Combinations are special rules for merging methods with a same name found in different mixins. There are four
combinations available:

- `primary` methods, the most common combination demonstrated in Basic Usage section. Every method is _primary_ by
  default and when there are many of them coming from mixins the forst one is taken. Primary method in a subclass
  overrides primary methods in base classes. That's how the mixins should work according to a common knowledge.
- `before` methods, which are a hooks executed before the primary method in _the same order_ as they appear in mixins
  list.
- `after` methods, which are a hooks executed after the primary method in _the opposite order_ as they appear in mixins
  list.
- `around` methods, which wrap the primary method calls.

In order for method combinations to work, all target class declaration must be preceded with `@mixin` decorator or
use `@mixin.extends` option to merge mixins.

When using `@mixin` decorator a base class is treated just like another mixin, so it's possible to use
standard `class extends` together with `@mixin`/`@mixin.extends` decorator and all method combinations will be aplied
properly. Also, it's possible to add method combinations is a subclass or mixin target.

### @before method( a, b, ... ){ ... }

Execute the given function before the method will be called. Receives the same set of arguments, the return value is
ignored.
If there are many `before` methods coming from different mixins, they will be executed in the same order as they appear
in mixins.

```javascript
class ExtendState {
    @after componentWillMount() {
        this.state.something = "Hi";
    }
}

@mixin class B extends join(React.Component, ExtendState) {
    componentWillMount() {
        this.state = { text: 'Hello' };
    }

...
}

// or, as an alternative
@mixin.extends(ExtendState) class B extends React.Component {
    componentWillMount() {
        this.state = { text: 'Hello' };
    }

...
}

// or, as another alternative
@mixin class ExtendState extends React.Component {
    @after componentWillMount() {
        this.state.something = "Hi";
    }
}

@mixin class B extends ExtendState {
    componentWillMount() {
        this.state = { text: 'Hello' };
    }

...
}
```

### @before.do( aspect ) method( a, b, ... ){ ... }

The generalized form of `@before` attaching the before aspect represented as function to the given primary method. Think
of it as a single-function mixins.

```javascript
function extendState() {
    this.state.something = "Hi";
}

@mixin class B extends React.Component {
    @before.do(extendState) componentWillMount() {
        this.state = { text: 'Hello' };
    }

...
}
```

### @after method( a, b, ... ){ ... }

Execute the given function after the method will be called. Receives the same set of arguments, the return value is
ignored.
If there are many `after` methods coming from different mixins, they will be executed in the opposite order as they
appear in mixins.

```javascript
@mixin class EventfulComponent extends Messenger {
    @after componentWillUnmount() {
        this.stopListening()
    }
}

class MyComponent extends join(React.Component, EventfulComponent) {
    componentWillUnmount() {
        console.log('Unmounting');
    }
}
```

### @after.do( aspect ) method( a, b, ... ){ ... }

The generalized form of `@after` attaching the after aspect represented as function to the given primary method. Think
of it as a single-function mixins.

```javascript
function unsubscribe() {
    this.stopListening()
}

@mixin class MyComponent extends join(React.Component, Messenger) {

    @after.do(unsubscribe) componentWillUnmount() {
        console.log('Unmounting');
    }
}
```

### @around method( a, b, ... ){ ... }

Wrap the method call into the given function. The original method can be called with `mixin.nextAround( a, b, ... )`
or  `mixin.applyNextAround()` to call it with the original set of arguments.

```javascript
class A {
    @around shouldComponentUpdate(nextProps) {
        return mixin.applyNextAround() && nextProps.a !== this.props.a;
    }
}

@mixin class B extends join(React.Component, A) {
...

    shouldComponentUpdate(nextProps) {
        return nextProps.b !== this.props.b;
    }
}
```

### @around.do( aspect ) method( a, b, ... ){ ... }

The generalized form of `@around`.

```javascript
class A {
    @around.do(
        function (nextProps) {
            return mixin.applyNextAround() && nextProps.a !== this.props.a;
        }
    ) shouldComponentUpdate(nextProps) { // Provide the default shouldComponentUpdate implementation.
        return true;
    }
}

@mixin class B extends join(React.Component, A) {
...

    shouldComponentUpdate(nextProps) {
        return nextProps.b !== this.props.b;
    }
}
```

## TODO: Properties combinations

### @after.set( fun ) prop

Execute the given function after the value has changed.

```javascript
class Observer {
    @after.set(function () {
        console.log(`I see you, ${this.value}!`);
    }) value;
}

@mixin.extends(Observer) class B {
...

    doSomething() {
        this.value = 5; // Will print "I see you, 5"
    }
}
```

### @before.set( fun ) prop

Execute the given function before the value has changed.

```javascript
class Observer {
    @before.set(function (x) {
        console.log(`I see you last time, ${x}!`);
    }) value;
}

@mixin.extends(Observer) class B {
...

    doSomething() {
        this.value = 5; // Will print "I see you, 5"
    }
}
```

### @around.set( fun ) prop

Tap into the property modification process.

```javascript
class Observer {
    @around.set(function (x) {
        callNextFunction(Number(x));
    }) value;
}

@mixin.extends(Observer) class B {
...

    doSomething() {
        this.value = 5; // Will print "I see you, 5"
    }
}
```
