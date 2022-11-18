WL.registerComponent('blockHandler', {
    vrCamera: {type: WL.Type.Object, default: null},
    speed: {type: WL.Type.Float, default: 5.0 },
    spawnDistance: {type: WL.Type.Float, default: 20.0 },
    hitTextObject: {type: WL.Type.Object, default: null},
    missedTextObject: {type: WL.Type.Object, default: null}
}, {
    init: function() {
        if (this.vrCamera == null){
            console.warning('blockHandler needs a vrCamera assigning to support motion through space ');
        }
        this.rotation = glMatrix.quat.create();
        glMatrix.quat.fromEuler(this.rotation, 1, 1, 0);
        this.tmpQuat = glMatrix.quat.create();  
        this.direction = glMatrix.vec3.create();
        this.tmpVec = glMatrix.vec3.create();
        this.tmpVec1 = glMatrix.vec3.create();
    },
    start: function() {
        this.cube = this.object.children[0];
        this.hit = 0;
        this.missed = -1;
        if (this.hitTextObject) this.hitText = this.hitTextObject.getComponent('text');
        if (this.missedTextObject) this.missedText = this.missedTextObject.getComponent('text');
        this.sfxExplosion = this.object.addComponent('howler-audio-source', {src: 'sfx/explosion.mp3', spatial: false});
        this.sfxSwish = this.object.addComponent('howler-audio-source', {src: 'sfx/swish.mp3', spatial: false});
        this.spawn();
    },
    updateCount: function( textComp, value ){
        if (textComp == null) return;
        textComp.text = value.toString();
    },
    spawn: function() { 
        if ( this.vrCamera == null ) return;
        this.vrCamera.getForward( this.direction );
        glMatrix.vec3.copy( this.tmpVec, this.direction );
        glMatrix.vec3.scale( this.tmpVec, this.tmpVec, this.spawnDistance );
        this.vrCamera.getTranslationWorld( this.tmpVec1 );
        glMatrix.vec3.add( this.tmpVec, this.tmpVec, this.tmpVec1 );
        this.object.setTranslationWorld( this.tmpVec );
        glMatrix.vec3.scale( this.direction, this.direction, -this.speed );
    },
    hitBlock: function(){
        console.log('blockHandler.hitBlock called')
        this.hit++;
        this.updateCount( this.hitText, this.hit );
        //play sfx
        this.sfxExplosion.play();
        this.spawn();
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
            if (theta > Math.PI/2 ){
                this.sfxSwish.play();
                this.missed++;
                this.updateCount( this.missedText, this.missed );
                this.spawn();
            }
        }
    },
});
