WL.registerComponent('MovePlayer', {
    //navmesh: {type: WL.Type.Object, default: null},
    camera: { type: WL.Type.Object },
    speed: { type: WL.Type.Float, default: 2.0 }
}, {
    init: function() {
        this.tmpPos = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.down = new Float32Array(3);
        this.down.set([0,-1,0]);
        this.selectPressed = { left: false, right: false };
    },
    start: function() {
        //this.physx = (this.navmesh) ? this.navmesh.getComponent('physx') : null;
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
    },
    update: function(dt) {
        if ( this.camera == null ) return;
        if (this.getSelectPressed()){
            this.object.getTranslationWorld( this.tmpPos );
            this.camera.getForward( this.tmpVec );

            glMatrix.vec3.scale(this.tmpVec, this.tmpVec, dt * this.speed);
            glMatrix.vec3.add( this.tmpPos, this.tmpPos, this.tmpVec);
            
            this.tmpPos[1] += 1;
            
            let rayhit = WL.physics.rayCast(this.tmpPos, this.down, 255, 5.0);
            
            if (rayhit.hitCount>0){
                this.object.setTranslationWorld(rayhit.locations[0]);
            }
        }
    },
    setupVREvents: function(s){
    	s.addEventListener('selectstart', this.selectStart.bind(this));
        s.addEventListener('selectend', this.selectEnd.bind(this));
    },
    selectStart: function(e){
    	this.selectPressed[e.inputSource.handedness] = true;	
    },
    selectEnd: function(e){
    	this.selectPressed[e.inputSource.handedness] = false;
    },
    getSelectPressed: function(){
    	return this.selectPressed.left || this.selectPressed.right;
    }
});
