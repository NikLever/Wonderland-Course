WL.registerComponent('BulletHandler', {
}, {
    init: function() {
        this.direction = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.elapsedTime = 0;
    },
    start: function(){
        this.collision = this.object.addComponent('collision');
        this.collision.extents[0] = 0.1;
        this.collision.group = (1 << this.collisionGroup);
        this.object.getTranslationWorld( this.tmpVec );
        this.object.resetTranslationRotation();
        this.object.rotateAxisAngleDeg([0,1,0], 90);
        this.object.setTranslationWorld( this.tmpVec );
    },
    update: function(dt) {
        glMatrix.vec3.copy( this.tmpVec, this.direction );
        glMatrix.vec3.scale( this.tmpVec, this.tmpVec, dt * 10 );
        this.object.translate( this.tmpVec );
        this.elapsedTime += dt;
        if ( this.elapsedTime > 3) this.object.active = false;
        const overlaps = this.collision.queryOverlaps();
        if (overlaps.length > 0){
            console.log('BulletHandler.update: overlap');
            const ghoulHandler = overlaps[0].object.parent.getComponent( 'GhoulHandler' );
            if (ghoulHandler) ghoulHandler.shot();
            this.object.active = false;
        }
    },
});
