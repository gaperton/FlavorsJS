import { mixins, before, after, around, callNextMethod } from './index'

class SimpleMixin {
    a(){ return 'SimpleMixin'; }
    b(){ return 'SimpleMixin'; }
    c(){ return 'SimpleMixin'; }
}

class ComplexMixin {
    @before
    a(){ return 'ComplexMixin'; }

    @after
    b(){ return 'ComplexMixin'; }

    @around
    c(){
        callNextMethod();
        return 'ComplexMixin';
    }
}

describe( 'simple mixins', ()=>{    
    it( 'properly merge simple mixins', () => {

        interface Target extends SimpleMixin {}
        @mixins( SimpleMixin )
        class Target {
            b(){
                return 'Target';
            }
        }

        const t = new Target();

        expect( t.b() ).toEqual( 'Target' );
        expect( t.a() ).toEqual( 'SimpleMixin' );
    })
});

function anotherComplexMixin(){
    return "AnotherComplexMixin";
}

class AnotherComplexMixin {
    @before( anotherComplexMixin )
    a(){ return 'ComplexMixin'; }

    @after
    b(){ return 'ComplexMixin'; }

    @around
    c(){
        callNextMethod();
        return 'ComplexMixin';
    }
}

interface SimpleTarget extends SimpleMixin, ComplexMixin {}
@mixins( SimpleMixin, ComplexMixin )
class SimpleTarget {
    a(){ return 'SimpleTarget'; }
}