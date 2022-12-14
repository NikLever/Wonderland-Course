WL.registerComponent('mathTest', {
    option: {type: WL.Type.Enum, values:['position', 'orbit', 'spin', 'scale', 'challenge'], default: 'position'},
}, {
    init: function() {
        this.startTransform = new Float32Array(8);
        this.startPosition = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.tmpVec1 = new Float32Array(3);
        this.tmpQuat = new Float32Array(4);
        this.tmpTransform = new Float32Array(8);
        this.origin = new Float32Array(3);
        this.time = 0;
    },
    start: function() {
        this.startTransform.set( this.object.transformWorld );
        this.object.getTranslationWorld( this.startPosition );
        document.addEventListener('mousedown', this.compare.bind(this) );
    },
    compare: function(){
        this.object.getTranslationWorld( this.tmpVec );
        glMatrix.quat2.getTranslation( this.tmpVec1, this.object.transformWorld );
        console.log(`mathTest.start getTranslationWorld:${this.f32ToString(this.tmpVec)} from transform:${this.f32ToString(this.tmpVec1)}`);
        glMatrix.quat2.getReal( this.tmpQuat, this.object.transformWorld );
        console.log(`mathTest.start rotationWorld:${this.f32ToString(this.object.rotationWorld)} from transform:${this.f32ToString(this.tmpQuat)}`);
    },
    position: function(){
        this.tmpVec.set( [0, Math.cos(this.time), 0] );
        glMatrix.vec3.add( this.tmpVec, this.startPosition, this.tmpVec);
        this.object.setTranslationWorld( this.tmpVec );
    },
    orbit: function(){
        const radius = 2;
        this.tmpVec.set( [Math.sin(this.time) * radius, 0, Math.cos(this.time) * radius] );
        glMatrix.vec3.add( this.tmpVec, this.startPosition, this.tmpVec);
        this.object.setTranslationWorld( this.tmpVec );
    },
    spin: function(dt){
        const theta = dt * 3;
        const local = true;
        if (local){
            this.object.getTranslationLocal(this.tmpVec);
            this.object.setTranslationLocal(this.origin);
            glMatrix.quat.rotateY( this.tmpQuat, this.object.rotationLocal, theta);
            glMatrix.quat.copy( this.object.rotationLocal, this.tmpQuat );
            this.object.setTranslationLocal( this.tmpVec );
        }else{
            this.object.setTranslationWorld(this.origin);
            glMatrix.quat.rotateY( this.tmpQuat, this.object.rotationWorld, theta);
            glMatrix.quat.copy( this.object.rotationWorld, this.tmpQuat );
            this.object.setTranslationWorld( this.startPosition );
        }
    },
    challenge: function(dt){
        //Combine orbit and spin
        const theta = dt * 3;
        this.object.setTranslationLocal(this.origin);
        glMatrix.quat.rotateY( this.tmpQuat, this.object.rotationLocal, theta);
        glMatrix.quat.copy( this.object.rotationLocal, this.tmpQuat );
        const radius = 2;
        this.tmpVec.set( [Math.sin(this.time) * radius, 0, Math.cos(this.time) * radius] );
        glMatrix.vec3.add( this.tmpVec, this.startPosition, this.tmpVec);
        this.object.setTranslationWorld( this.tmpVec );
    },
    scale: function(){
        const s = (Math.cos( this.time ) + 1.2)*0.6;
        this.object.scalingWorld.set( [s,s,s] );
    },
    f32ToString: function( v, decimalCount=2 ){
        let str = '';
        v.forEach( (e) => {
            str += `${e.toFixed(decimalCount)}, `;
        });
        return str;
    },
    update: function(dt) {
        this.time += dt;

        switch(this.option){
            case 0:
                this.position();
                break;
            case 1:
                this.orbit();
                break;
            case 2:
                this.spin(dt);
                break;
            case 3:
                this.scale();
                break;
            case 4:
                this.challenge(dt);
                break;
        }
    },
});
