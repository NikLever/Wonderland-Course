WL.registerComponent('blockHandler', {
    vrCamera: {type: WL.Type.Object, default: null},
    speed: {type: WL.Type.Float, default: 5.0 },
    countTextObject: {type: WL.Type.Object, default: null}
}, {
    init: function() {
        this.rotation = glMatrix.quat.create();
        glMatrix.quat.fromEuler(this.rotation, 1, 1, 0);
        this.tmpQuat = glMatrix.quat.create();
        this.cube = this.object.children[0];
        this.direction = glMatrix.vec3.create();
        this.tmpVec = glMatrix.vec3.create();
        this.tmpVec1 = glMatrix.vec3.create();
    },
    start: function() {
        this.count = 0;
        if (this.countTextObject) this.countText = this.countTextObject.getComponent('text');
        this.updateCount(); 
        this.spawn();
    },
    updateCount: function(){
        if (this.countText == null) return;
        this.countText.text = this.count;
        console.log(`count=${this.count}`);
    },
    spawn: function() {
        if ( this.vrCamera == null ) return;
        this.vrCamera.getForward( this.direction );
        glMatrix.vec3.copy( this.tmpVec, this.direction );
        glMatrix.vec3.scale( this.tmpVec, this.tmpVec, 30 );
        this.vrCamera.getTranslationWorld( this.tmpVec1 );
        glMatrix.vec3.add( this.tmpVec, this.tmpVec, this.tmpVec1 );
        this.object.setTranslationWorld( this.tmpVec );
        glMatrix.vec3.negate( this.direction, this.direction );
        glMatrix.vec3.scale( this.direction, this.direction, this.speed );
        this.count++;
        this.updateCount();
    },
    update: function(dt) {
        glMatrix.quat.scale( this.tmpQuat, this.rotation, dt );
        this.cube.rotateObject( this.tmpQuat );
        if ( this.vrCamera != null ){
            glMatrix.vec3.copy( this.tmpVec, this.direction );
            glMatrix.vec3.scale( this.tmpVec, this.tmpVec, dt );
            this.object.translate( this.tmpVec );
            this.object.getTranslationWorld( this.tmpVec );
            this.vrCamera.getTranslationWorld( this.tmpVec1 );
            glMatrix.vec3.subtract( this.tmpVec, this.tmpVec, this.tmpVec1 );
            glMatrix.vec3.normalize( this.tmpVec, this.tmpVec );
            this.vrCamera.getForward( this.tmpVec1 );
            const theta = glMatrix.vec3.angle( this.tmpVec, this.tmpVec1 );
            if (theta > Math.PI/2 ) this.spawn();
        }
    },
});
