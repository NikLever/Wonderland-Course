WL.registerComponent('BlockHandler', {
    vrCamera: {type: WL.Type.Object, default: null},
    speed: {type: WL.Type.Float, default: 5.0},
}, {
    init: function() {
        //console.log('init() with param', this.param);
        //this.rotation = glMatrix.quat.create();
        this.rotation = new Float32Array(4);
        glMatrix.quat.fromEuler( this.rotation, 1, 1, 0 );
        this.tmpQuat = glMatrix.quat.create();

        this.direction = glMatrix.vec3.create();
        this.tmpVec = glMatrix.vec3.create();
        this.tmpVec1 = glMatrix.vec3.create();
    },
    start: function() {
        //console.log('start() with param', this.param);
        this.cube = this.object.children[0];

        this.spawn();
    },
    spawn: function(){
        if ( this.vrCamera == null ) return;
        this.vrCamera.getForward( this.direction );
        console.log( `vrCamera foward z: ${this.direction[2].toFixed(2)}`)
        glMatrix.vec3.copy( this.tmpVec, this.direction );
        glMatrix.vec3.scale( this.tmpVec, this.tmpVec, 30 );
        this.vrCamera.getTranslationWorld( this.tmpVec1 );
        glMatrix.vec3.add( this.tmpVec, this.tmpVec, this.tmpVec1 );
        this.object.setTranslationWorld( this.tmpVec );
        glMatrix.vec3.scale( this.direction, this.direction, -this.speed );
    },
    update: function(dt) {
        //console.log('update() with delta time', dt);
        glMatrix.quat.scale( this.tmpQuat, this.rotation, dt );
        this.cube.rotateObject( this.tmpQuat );
        if ( this.vrCamera != null ){
            glMatrix.vec3.copy( this.tmpVec, this.direction );
            glMatrix.vec3.scale( this.tmpVec, this.tmpVec, dt );
            this.object.translate( this.tmpVec );
            //Has the block passed the camera
            this.object.getTranslationWorld( this.tmpVec );
            //console.log( `z: ${this.tmpVec[2].toFixed(2)}`)
            this.vrCamera.getTranslationWorld( this.tmpVec1 );
            glMatrix.vec3.subtract( this.tmpVec, this.tmpVec, this.tmpVec1 );
            glMatrix.vec3.normalize( this.tmpVec, this.tmpVec );
            this.vrCamera.getForward( this.tmpVec1 );
            const theta = glMatrix.vec3.angle( this.tmpVec, this.tmpVec1 );
            if ( theta > Math.PI/2 ) this.spawn();
        }
    },
});
