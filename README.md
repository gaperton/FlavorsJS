# TODO

## API

### @mixins( A, B, ... )

Merge mixins in the given order.

### @mixins

When `@mixins` decorator is called without arguments, apply base class method combinations as if the inheritance would be the mixin

### @before method( a, b, ... ){ ... }

Execute the given function before the method will be called.
When called with argument `@before( fun )`, attaches the given function as before combination while treating the method as primary.

```javascript
@mixins( Events )
class A {
    @before componentWillUnmount(){
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

### @after method( a, b, ... ){ ... }

Execute the given function after the method will be called. Works similar to before.

```javascript
class A {
    ...

    @after componentWillMount(){
        console.log( this.state );
    }
}

@mixins( A )
class B {
    componentWillMount(){
        this.state = { text : "Hi" };
    }
    ...
}
```

### @around method( a, b, ... ){ ... }

Wrap the method call into the given function.

```javascript
class A {
    ...

    @around(
        function( nextProps ){
            return callNextMethod( nextProps ) && nextProps.a !== this.props.a;
        }
    )
    shouldComponentUpdate( nextProps ){
        return true;
    }
}

@mixins( A )
class B {
    ...

    shoulComponentUpdate( nextProps ){
        return nextProps.b !== this.props.b;
    }
}
```

### @afterSet( fun ) prop

Execute the given function after the value has changed.

```javascript
class Observer {
    @afterSet( function(){
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

### @beforeSet( fun ) prop

Execute the given function before the value has changed.

```javascript
class Observer {
    @beforeSet( function( x ){
        console.log( `I see you, ${ x }!` );
        return x / 10;
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